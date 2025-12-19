import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from "firebase/firestore"
import { db } from "../firebase/config"

export const crearActivo = async data => {
  await addDoc(collection(db, "activos"), {
    ...data,
    creadoEn: Timestamp.now(),
    historial_propietarios: [data.propietarioActual],
  })
}

export const obtenerActivos = async () => {
  const snap = await getDocs(collection(db, "activos"))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const obtenerActivo = async id => {
  const snap = await getDoc(doc(db, "activos", id))
  return { id: snap.id, ...snap.data() }
}

export const agregarPropietario = async (activoId, propietarioData) => {
  const ref = doc(db, "activos", activoId)
  const snap = await getDoc(ref)
  const activo = snap.data()

  await updateDoc(ref, {
    propietarioActual: propietarioData,
    historial_propietarios: [
      ...(activo.historial_propietarios || []),
      propietarioData,
    ],
    ultimaActualizacion: Timestamp.now(),
  })
}

export const actualizarActivo = async (activoId, datosActualizados) => {
  const ref = doc(db, "activos", activoId)
  await updateDoc(ref, {
    ...datosActualizados,
    ultimaActualizacion: Timestamp.now(),
  })
}

export const eliminarActivo = async id =>
  deleteDoc(doc(db, "activos", id))
