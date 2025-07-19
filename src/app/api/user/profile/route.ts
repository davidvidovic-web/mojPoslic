import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    const {
      name,
      bio,
      phone,
      location,
      website,
      skills,
      experience,
      preferredJobTypes,
    } = await request.json();

    // Get current user to check role and profile setup status
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, profileSetupCompleted: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Base update data - only allow changes to basic fields if profile setup is not completed
    const baseUpdateData: Record<string, string | undefined> = {};

    // If profile setup is not completed, allow basic field updates
    if (!currentUser.profileSetupCompleted) {
      if (name !== undefined) baseUpdateData.name = name;
      if (phone !== undefined) baseUpdateData.phone = phone;
      if (location !== undefined) baseUpdateData.location = location;
    }

    // Website is always updatable
    if (website !== undefined) baseUpdateData.website = website;

    // Only include professional fields for non-client roles
    if (currentUser.role !== "client") {
      if (bio !== undefined) baseUpdateData.bio = bio;
      if (skills !== undefined) baseUpdateData.skills = skills;
      if (experience !== undefined) baseUpdateData.experience = experience;

      // Handle preferred job types array conversion
      if (preferredJobTypes !== undefined) {
        baseUpdateData.preferredJobTypes = Array.isArray(preferredJobTypes)
          ? preferredJobTypes.join(", ")
          : preferredJobTypes;
      }
    }

    // Update the user with validated data
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: baseUpdateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        skills: true,
        experience: true,
        preferredJobTypes: true,
        preferredLanguage: true,
        role: true,
        profileSetupCompleted: true,
        createdAt: true,
      },
    });

    // Convert preferredJobTypes string back to array for frontend consumption
    const userWithArrayJobTypes = {
      ...updatedUser,
      preferredJobTypes: updatedUser.preferredJobTypes
        ? updatedUser.preferredJobTypes.split(", ")
        : [],
    };

    return NextResponse.json({ user: userWithArrayJobTypes });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    // Use timeout to prevent hanging requests during database issues
    const userPromise = prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        skills: true,
        experience: true,
        preferredJobTypes: true,
        preferredLanguage: true,
        role: true,
        profileSetupCompleted: true,
        createdAt: true,
      },
    });

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Database timeout")), 8000); // 8 second timeout
    });

    const user = await Promise.race([userPromise, timeoutPromise]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert preferredJobTypes string back to array for frontend consumption
    const userWithArrayJobTypes = {
      ...user,
      preferredJobTypes: user.preferredJobTypes
        ? user.preferredJobTypes.split(", ")
        : [],
    };

    return NextResponse.json({ user: userWithArrayJobTypes });
  } catch (error) {
    console.error("Profile fetch error:", error);

    // Return more specific error for timeouts
    if (error instanceof Error && error.message === "Database timeout") {
      return NextResponse.json(
        { error: "Database temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
