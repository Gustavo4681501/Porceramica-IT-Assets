import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase/config"

function TestFirebase() {

  const guardar = async () => {
    await addDoc(collection(db, "test"), {
      mensaje: "Firebase conectado correctamente",
      fecha: new Date(),
    })
    alert("🔥 Conectado a Firebase")
  }

  return (
    <button onClick={guardar}>
      Probar Firebase
    </button>
  )
}

export default TestFirebase
