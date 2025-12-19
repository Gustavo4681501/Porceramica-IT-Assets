import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  obtenerActivos,
  eliminarActivo,
  crearActivo
} from "../../services/activos.service"
import ModalFirma from "../../components/ModalFirma"
import "./Home.css"

export default function Home() {
  const [activos, setActivos] = useState([])

  // Activo
  const [serial, setSerial] = useState("")
  const [imei, setImei] = useState("")
  const [categoria, setCategoria] = useState("")
  const [otraCategoria, setOtraCategoria] = useState("")
  const [marca, setMarca] = useState("")
  const [modelo, setModelo] = useState("")
  const [estado, setEstado] = useState("asignado")
  const [observaciones, setObservaciones] = useState("")

  // Propietario
  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")

  // Modal firma
  const [modalAbierto, setModalAbierto] = useState(false)
  const [esperandoFirma, setEsperandoFirma] = useState(false)

  const navigate = useNavigate()

  const cargarActivos = useCallback(async () => {
    const data = await obtenerActivos()
    setActivos(data)
  }, [])

  useEffect(() => {
    cargarActivos()
  }, [cargarActivos])

  const handleEliminar = async id => {
    if (!confirm("❌ ¿Eliminar este activo?")) return
    await eliminarActivo(id)
    await cargarActivos()
  }

  const iniciarAgregarActivo = () => {
    const catFinal = categoria === "Otro" ? otraCategoria : categoria

    if (
      !serial ||
      !catFinal ||
      !marca ||
      !modelo ||
      !nombreInput ||
      !idInput
    ) {
      alert("⚠️ Completa todos los campos obligatorios")
      return
    }

    setEsperandoFirma(true)
    setModalAbierto(true)
  }

  const guardarActivo = async firmaBase64 => {
    const catFinal = categoria === "Otro" ? otraCategoria : categoria

    const propietarioActual = {
      nombre: nombreInput,
      identificacion: idInput,
      fechaAsignacion: new Date(),
      firmaBase64,
    }

    await crearActivo({
      serialNumber: serial,
      imei1: imei || null,
      categoria: catFinal,
      marca,
      modelo,
      estado,
      observaciones: observaciones || null,
      propietarioActual,
    })

    // limpiar
    setSerial("")
    setImei("")
    setCategoria("")
    setOtraCategoria("")
    setMarca("")
    setModelo("")
    setEstado("asignado")
    setObservaciones("")
    setNombreInput("")
    setIdInput("")
    setModalAbierto(false)
    setEsperandoFirma(false)

    await cargarActivos()
  }

  return (
    <div className="home-container container">
      <h1 className="mb-4">💻 Gestión de Activos IT</h1>

      <div className="nuevo-activo-form card shadow p-4 mb-5">
        <h5 className="mb-3"> Registrar nuevo activo</h5>

        <input placeholder="Serial *" value={serial} onChange={e => setSerial(e.target.value)} />
        <input placeholder="IMEI (opcional)" value={imei} onChange={e => setImei(e.target.value)} />

        <select value={categoria} onChange={e => setCategoria(e.target.value)}>
          <option value="">Categoría *</option>
          <option>Celular</option>
          <option>Laptop</option>
          <option>PC</option>
          <option>Tablet</option>
          <option>Monitor</option>
          <option>Otro</option>
        </select>

        {categoria === "Otro" && (
          <input
            placeholder="Especificar categoría *"
            value={otraCategoria}
            onChange={e => setOtraCategoria(e.target.value)}
          />
        )}

        <input placeholder="Marca *" value={marca} onChange={e => setMarca(e.target.value)} />
        <input placeholder="Modelo *" value={modelo} onChange={e => setModelo(e.target.value)} />

        <select value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="asignado">Asignado ✅</option>
          <option value="en_bodega">En bodega 📦</option>
          <option value="en_reparacion">En reparación 🛠️</option>
        </select>

        <textarea
          placeholder="Observaciones (opcional)"
          value={observaciones}
          onChange={e => setObservaciones(e.target.value)}
          rows={3}
        />

        <hr />

        <input placeholder="Nombre del propietario *" value={nombreInput} onChange={e => setNombreInput(e.target.value)} />
        <input placeholder="ID del propietario *" value={idInput} onChange={e => setIdInput(e.target.value)} />

        <button className="btn btn-primary mt-3" onClick={iniciarAgregarActivo}>
           Continuar con firma
        </button>
      </div>

      <div className="activos-grid">
        {activos.map(a => (
          <div key={a.id} className="card activo-card shadow">
            <div className="card-body" onClick={() => navigate(`/activo/${a.id}`)}>
              <h6> {a.categoria} - {a.marca}</h6>
              <p> <strong>Modelo:</strong> {a.modelo}</p>
              <p> <strong>Serial:</strong> {a.serialNumber}</p>
              <p> <strong>Estado:</strong> {a.estado}</p>
              <p> <strong>Propietario:</strong> {a.propietarioActual?.nombre}</p>
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(a.id)}>
                ❌ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && esperandoFirma && (
        <ModalFirma
          onClose={() => {
            setModalAbierto(false)
            setEsperandoFirma(false)
          }}
          onSave={guardarActivo}
        />
      )}
    </div>
  )
}
