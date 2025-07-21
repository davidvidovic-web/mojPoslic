import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase-auth'

export async function POST() {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    
    console.log('Applying NextAuth RLS integration migration...')
    
    // Helper function to get current user ID from headers
    const createGetCurrentUserIdFunction = `
      CREATE OR REPLACE FUNCTION get_current_user_id()
      RETURNS TEXT AS $$
      BEGIN
        RETURN current_setting('request.headers', true)::json->>'x-user-id';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Helper function to get current user role
    const createGetCurrentUserRoleFunction = `
      CREATE OR REPLACE FUNCTION get_current_user_role()
      RETURNS TEXT AS $$
      BEGIN
        RETURN coalesce(
          current_setting('request.headers', true)::json->>'x-user-role',
          'user'
        );
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'user';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Update user participation helper
    const updateUserParticipationFunction = `
      CREATE OR REPLACE FUNCTION user_participates_in_conversation(conv_id UUID, user_id_param TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 
          FROM conversation_participants cp
          WHERE cp.conversation_id = conv_id 
          AND cp.user_id = user_id_param
          AND cp.left_at IS NULL
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Execute functions
    await supabaseAdmin.rpc('exec_sql', { sql: createGetCurrentUserIdFunction })
    await supabaseAdmin.rpc('exec_sql', { sql: createGetCurrentUserRoleFunction })
    await supabaseAdmin.rpc('exec_sql', { sql: updateUserParticipationFunction })
    
    // Drop old policies
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view their own participation" ON conversation_participants;',
      'DROP POLICY IF EXISTS "Users can view other participants" ON conversation_participants;',
      'DROP POLICY IF EXISTS "Users can be added to conversations" ON conversation_participants;',
      'DROP POLICY IF EXISTS "Users can update their participation" ON conversation_participants;',
      'DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;',
      'DROP POLICY IF EXISTS "Users can create conversations" ON conversations;',
      'DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;',
      'DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;',
      'DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;',
      'DROP POLICY IF EXISTS "Users can edit their own messages" ON messages;',
      'DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;',
      'DROP POLICY IF EXISTS "Users can view message status" ON message_status;',
      'DROP POLICY IF EXISTS "Users can create message status" ON message_status;',
      'DROP POLICY IF EXISTS "Users can update message status" ON message_status;'
    ]
    
    for (const dropSql of dropPolicies) {
      try {
        await supabaseAdmin.rpc('exec_sql', { sql: dropSql })
      } catch (error) {
        console.log('Policy drop error (may not exist):', error)
      }
    }
    
    // Create new policies
    const newPolicies = [
      `CREATE POLICY "nextauth_users_can_view_own_participation" ON conversation_participants
       FOR SELECT USING (user_id = get_current_user_id());`,
      
      `CREATE POLICY "nextauth_users_can_view_other_participants" ON conversation_participants
       FOR SELECT USING (
         user_id != get_current_user_id() AND
         EXISTS (
           SELECT 1 FROM conversation_participants cp 
           WHERE cp.conversation_id = conversation_participants.conversation_id 
           AND cp.user_id = get_current_user_id() 
           AND cp.left_at IS NULL
         )
       );`,
      
      `CREATE POLICY "nextauth_users_can_be_added_to_conversations" ON conversation_participants
       FOR INSERT WITH CHECK (true);`,
      
      `CREATE POLICY "nextauth_users_can_update_own_participation" ON conversation_participants
       FOR UPDATE USING (user_id = get_current_user_id())
       WITH CHECK (user_id = get_current_user_id());`,
      
      `CREATE POLICY "nextauth_users_can_view_their_conversations" ON conversations
       FOR SELECT USING (
         user_participates_in_conversation(id, get_current_user_id())
       );`,
      
      `CREATE POLICY "nextauth_users_can_create_conversations" ON conversations
       FOR INSERT WITH CHECK (true);`,
      
      `CREATE POLICY "nextauth_users_can_update_their_conversations" ON conversations
       FOR UPDATE USING (
         user_participates_in_conversation(id, get_current_user_id())
       ) WITH CHECK (
         user_participates_in_conversation(id, get_current_user_id())
       );`,
      
      `CREATE POLICY "nextauth_users_can_view_messages_in_their_conversations" ON messages
       FOR SELECT USING (
         user_participates_in_conversation(conversation_id, get_current_user_id())
       );`,
      
      `CREATE POLICY "nextauth_users_can_send_messages_to_their_conversations" ON messages
       FOR INSERT WITH CHECK (
         sender_id = get_current_user_id() AND
         user_participates_in_conversation(conversation_id, get_current_user_id())
       );`,
      
      `CREATE POLICY "nextauth_users_can_edit_own_messages" ON messages
       FOR UPDATE USING (sender_id = get_current_user_id())
       WITH CHECK (sender_id = get_current_user_id());`,
      
      `CREATE POLICY "nextauth_users_can_view_message_status" ON message_status
       FOR SELECT USING (
         user_id = get_current_user_id() OR
         EXISTS (
           SELECT 1 FROM messages m 
           WHERE m.id = message_status.message_id 
           AND m.sender_id = get_current_user_id()
         )
       );`,
      
      `CREATE POLICY "nextauth_users_can_create_message_status" ON message_status
       FOR INSERT WITH CHECK (user_id = get_current_user_id());`,
      
      `CREATE POLICY "nextauth_users_can_update_message_status" ON message_status
       FOR UPDATE USING (user_id = get_current_user_id())
       WITH CHECK (user_id = get_current_user_id());`
    ]
    
    for (const policySql of newPolicies) {
      await supabaseAdmin.rpc('exec_sql', { sql: policySql })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'NextAuth RLS integration migration applied successfully',
      functionsCreated: 3,
      policiesDropped: dropPolicies.length,
      policiesCreated: newPolicies.length
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
