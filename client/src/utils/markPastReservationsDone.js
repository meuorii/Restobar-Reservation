import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const markPastReservationsAsDone = async () => {
  const now = new Date();

  try {
    const snapshot = await getDocs(collection(db, "reservations"));
    const updates = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const resDate = new Date(`${data.date}T${data.time}`);

      if (
        resDate < now &&
        ["pending", "confirmed"].includes(data.status)
      ) {
        updates.push(
          updateDoc(doc(db, "reservations", docSnap.id), { status: "done" })
        );
      }
    });

    await Promise.all(updates);
    console.log(`✅ Marked ${updates.length} reservations as done`);
  } catch (error) {
    console.error("❌ Error updating reservations:", error);
  }
};
