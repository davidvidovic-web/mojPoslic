# Finish Job Button - User Guide

## Button Location

The **"Finish Job"** button appears in the Client Dashboard for active jobs.

### Where to Find It

1. **Navigate to**: Dashboard → My Jobs
2. **Look for**: Active Jobs section
3. **Button appears**: On each active job card, alongside other action buttons

### Button Appearance

```
┌─────────────────────────────────────────────────────────┐
│ Active Jobs                                          3  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Job Title: Fix Kitchen Sink                           │
│  Status: Active • Applications: 5                      │
│                                                         │
│  Category: Home Repairs                                │
│  Location: Sarajevo                                    │
│  Salary: 100-200 BAM                                   │
│                                                         │
│  ┌──────┐ ┌─────────┐ ┌────────────┐ ┌────────┐      │
│  │ Edit │ │ Feature │ │ Finish Job │ │ Delete │      │
│  └──────┘ └─────────┘ └────────────┘ └────────┘      │
│              ↑                                          │
│              └── Emerald green button with checkmark   │
└─────────────────────────────────────────────────────────┘
```

### Button Styling

- **Color**: Emerald green (professional, positive)
- **Icon**: CircleCheckBig (✓ in circle)
- **Text**: 
  - English: "Finish Job"
  - Bosnian: "Završi Posao"
- **Hover**: Solid emerald background with white text

## When to Use

Click "Finish Job" when:
- ✅ The work has been completed
- ✅ You're ready to review the tasker
- ✅ You want to close out the job

## What Happens

When you click the button:

1. **Dialog Opens**: "Finish Job & Leave Review"
2. **Tasker Info Shown**: Name of the person who did the work
3. **Rating Required**: 1-5 stars (mandatory)
4. **Comment Optional**: Write a review (optional)
5. **Submit**: Creates review and marks job as complete

### Behind the Scenes

The system automatically:
- ✅ Creates your review
- ✅ Marks job assignment as COMPLETED
- ✅ Marks conversations as inactive
- ✅ Updates job status to "completed"
- ✅ Notifies the tasker
- ✅ Allows tasker to leave their own review

## Important Notes

### Before Finishing
- Cannot be undone
- Job will move to "Expired Jobs" section
- Cannot delete job without finishing it first

### After Finishing
- Tasker receives notification
- Tasker can respond with their own review
- Job can be safely deleted
- Reviews are visible on profiles

## Translation Keys

### English (EN)
```json
{
  "finishJob": "Finish Job",
  "finishJobDialog": "Finish Job & Leave Review",
  "finishJobDescription": "Mark \"{jobTitle}\" as finished and review {taskerName}."
}
```

### Bosnian (BS)
```json
{
  "finishJob": "Završi Posao",
  "finishJobDialog": "Završi Posao i Ostavi Recenziju",
  "finishJobDescription": "Označite \"{jobTitle}\" kao završen i recenzirajte {taskerName}."
}
```

## UX Considerations

### Button Placement
- Position: 3rd from left (after Edit and Feature)
- Visibility: Always visible for active jobs
- Priority: High - important action

### Visual Hierarchy
1. **Edit** (most common action)
2. **Feature** (promotional action)
3. **Finish Job** (completion action) ← **NEW**
4. **Delete** (destructive action)

### Accessibility
- Clear icon and text
- Sufficient color contrast
- Touch-friendly size
- Keyboard accessible

## Future Improvements

Potential enhancements:
1. **Conditional Display**: Only show for jobs with active assignments
2. **Status Indicator**: Badge showing "Work in Progress"
3. **Quick Preview**: Hover tooltip with tasker info
4. **Bulk Actions**: Finish multiple jobs at once
5. **Reminder**: Notification when job completion is pending

## Testing Checklist

- [ ] Button appears on active jobs
- [ ] Button not on expired jobs
- [ ] Click opens finish dialog
- [ ] Dialog shows correct tasker name
- [ ] Rating validation works
- [ ] Comment is optional
- [ ] Success message shown
- [ ] Job moves to expired section
- [ ] Tasker receives notification
- [ ] Delete button works after finish

## Related Files

- Component: `src/components/dashboard/client/client-jobs-manager.tsx`
- Dialog: `src/components/dashboard/client/finish-job-dialog.tsx`
- Handler: `src/components/dashboard/client-dashboard.tsx`
- Mutation: `src/hooks/queries/useJobs.ts` (useFinishJobMutation)
- Translations: 
  - `translations/en/dashboard.json`
  - `translations/bs/dashboard.json`
