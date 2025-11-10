import { auth, db } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const adminRef = doc(db, "admins", "list");
  const adminSnap = await getDoc(adminRef);
  const adminIds = adminSnap.exists() ? adminSnap.data().adminIds || [] : [];

  const isAdmin = adminIds.includes(user.uid);
  if (!isAdmin) {
    await signOut(auth);
    throw new Error("You are not authorized to access the admin dashboard.");
  }

  return user;
}

export async function logout() {
  await signOut(auth);
}
