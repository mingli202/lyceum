import { ProfileData } from "@convex/types";
import Profile from "./Profile";

export default function ProfilePage() {
  const placeHolderData: ProfileData = {
    profileUrl: undefined,
    school: "McGill",
    major: "Software Engineering",
    firstName: "Firstname",
    lastName: "Lastname",
    username: "username",
    academicYear: 2025,
    city: "Montreal",
    email: "vincentmingliu@gmail.com",
    pictureUrl: undefined,
    bio: "I use Neovim (btw)",
    followers: [],
    following: [],
  };

  return <Profile data={placeHolderData} />;
}
