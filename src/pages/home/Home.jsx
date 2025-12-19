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
  const [precio, setPrecio] = useState("")

  // Accesorios
  const [accesorios, setAccesorios] = useState({
    estuche: false,
    bateria: false,
    cable: false,
    temperado: false,
    cargador: false,
    linea: false
  })
  const [lineaNumero, setLineaNumero] = useState("")
  const [lineaPlan, setLineaPlan] = useState(false)

  // Propietario
  const [asignarPropietario, setAsignarPropietario] = useState(false)
  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")

  // Firma
  const [modalAbierto, setModalAbierto] = useState(false)

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

  const toggleAccesorio = name => {
    setAccesorios(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const validarFormulario = () => {
    const catFinal = categoria === "Otro" ? otraCategoria : categoria

    if (!serial || !catFinal || !marca || !modelo) {
      alert("⚠️ Completa los campos obligatorios")
      return false
    }

    if (!estado) {
      alert("⚠️ Selecciona un estado")
      return false
    }

    if (asignarPropietario && !nombreInput) {
      alert("⚠️ Ingresa el nombre del propietario")
      return false
    }

    if (accesorios.linea && !lineaNumero) {
      alert("⚠️ Ingresa el número de la línea")
      return false
    }

    return true
  }

  const guardarActivo = async (firmaBase64 = null) => {
    const catFinal = categoria === "Otro" ? otraCategoria : categoria

    const propietarioActual = asignarPropietario
      ? {
          nombre: nombreInput,
          identificacion: idInput || "No proporcionado",
          fechaAsignacion: new Date(),
          firmaBase64,
        }
      : null

    await crearActivo({
      serialNumber: serial,
      imei1: imei || null,
      categoria: catFinal,
      marca,
      modelo,
      estado,
      observaciones: observaciones || null,
      precio: precio || null,
      accesorios: {
        ...accesorios,
        lineaNumero: accesorios.linea ? lineaNumero : null,
        lineaPlan: accesorios.linea ? lineaPlan : null
      },
      propietarioActual,
    })

    // Limpiar formulario
    setSerial("")
    setImei("")
    setCategoria("")
    setOtraCategoria("")
    setMarca("")
    setModelo("")
    setEstado("asignado")
    setObservaciones("")
    setPrecio("")
    setAsignarPropietario(false)
    setNombreInput("")
    setIdInput("")
    setAccesorios({
      estuche: false,
      bateria: false,
      cable: false,
      temperado: false,
      cargador: false,
      linea: false
    })
    setLineaNumero("")
    setLineaPlan(false)
    setModalAbierto(false)

    await cargarActivos()
  }

  const handleSubmit = () => {
    if (!validarFormulario()) return

    if (asignarPropietario) {
      setModalAbierto(true)
    } else {
      guardarActivo(null)
    }
  }

  const estadoTexto = estado => {
    switch (estado) {
      case "asignado": return "Asignado"
      case "en_bodega": return "En bodega"
      case "danado": return "Dañado"
      case "en_reparacion": return "En reparación"
      case "baja": return "Baja"
      case "reservado": return "Reservado"
      default: return "Desconocido"
    }
  }

  return (
    <div className="home-container container">
      <h1 className="mb-4 text-center">Gestión de Activos IT</h1>

      <div className="nuevo-activo-form card shadow-lg p-5 mb-5">
        <h5 className="form-title mb-4">Registrar nuevo activo</h5>

        {/* Información básica */}
        <div className="form-section">
          <input className="input-primary" placeholder="Serial *" value={serial} onChange={e => setSerial(e.target.value)} />
          <input className="input-primary" placeholder="IMEI (opcional)" value={imei} onChange={e => setImei(e.target.value)} />

          <select className="input-primary" value={categoria} onChange={e => setCategoria(e.target.value)}>
            <option value="">Categoría *</option>
            <option>Celular</option>
            <option>Laptop</option>
            <option>PC</option>
            <option>Tablet</option>
            <option>Monitor</option>
            <option>Otro</option>
          </select>

          {categoria === "Otro" && (
            <input className="input-primary" placeholder="Especificar categoría *" value={otraCategoria} onChange={e => setOtraCategoria(e.target.value)} />
          )}

          <input className="input-primary" placeholder="Marca *" value={marca} onChange={e => setMarca(e.target.value)} />
          <input className="input-primary" placeholder="Modelo *" value={modelo} onChange={e => setModelo(e.target.value)} />
          <input className="input-primary" placeholder="Precio " value={precio} onChange={e => setPrecio(e.target.value)} />

          <textarea className="textarea-primary" placeholder="Observaciones (opcional)" value={observaciones} onChange={e => setObservaciones(e.target.value)} />

          {/* Select de estado */}
          <select className="input-primary mt-2" value={estado} onChange={e => setEstado(e.target.value)}>
            <option value="">Estado *</option>
            <option value="asignado">Asignado</option>
            <option value="en_bodega">En bodega</option>
            <option value="danado">Dañado</option>
            <option value="en_reparacion">En reparación</option>
            <option value="baja">Baja</option>
            <option value="reservado">Reservado</option>
          </select>
        </div>

        {/* Accesorios */}
        <div className="form-section mt-4">
          <h6 className="section-title">Accesorios (opcional)</h6>
          <div className="accesorios-grid">
            {Object.keys(accesorios).map(a => (
              <div key={a} className="accesorio-item">
                <label>
                  <input type="checkbox" checked={accesorios[a]} onChange={() => toggleAccesorio(a)} /> {a.toUpperCase()}
                </label>
                {a === "linea" && accesorios.linea && (
                  <div className="linea-inputs mt-2">
                    <input className="input-primary" placeholder="Número de línea" value={lineaNumero} onChange={e => setLineaNumero(e.target.value)} />
                    <label className="ms-2">
                      <input type="checkbox" checked={lineaPlan} onChange={e => setLineaPlan(e.target.checked)} /> Con plan
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Propietario */}
        <div className="form-section mt-4">
          <h6 className="section-title">Propietario</h6>
          <label>
            <input type="checkbox" checked={asignarPropietario} onChange={e => setAsignarPropietario(e.target.checked)} /> Asignar a alguien
          </label>

          {asignarPropietario && (
            <>
              <input className="input-primary" placeholder="Nombre del propietario" value={nombreInput} onChange={e => setNombreInput(e.target.value)} />
              <input className="input-primary" placeholder="ID del propietario (opcional)" value={idInput} onChange={e => setIdInput(e.target.value)} />
            </>
          )}
        </div>

        <button className="btn-primary mt-4" onClick={handleSubmit}>
          {asignarPropietario ? "Continuar con firma ✍️" : "Guardar activo"}
        </button>
      </div>

      {/* Activos */}
      <div className="activos-grid mt-4">
        {activos.map(a => (
          <div key={a.id} className="card activo-card shadow-sm">
            <div className="card-body" onClick={() => navigate(`/activo/${a.id}`)}>
              <h6>
                {a.categoria} - {a.marca}{" "}
                <span className={`badge estado-${a.estado}`}>{estadoTexto(a.estado)}</span>
              </h6>
              <p><strong>Modelo:</strong> {a.modelo}</p>
              <p><strong>Serial:</strong> {a.serialNumber}</p>
              <p><strong>Propietario:</strong> {a.propietarioActual?.nombre || "No asignado"}</p>
              {a.accesorios?.linea && (
                <p>📱 Línea: {a.accesorios.lineaNumero} {a.accesorios.lineaPlan ? "(Con plan)" : "(Sin plan)"}</p>
              )}
            </div>
            <div className="card-footer text-end">
              <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(a.id)}>❌ Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <ModalFirma
          onClose={() => setModalAbierto(false)}
          onSave={guardarActivo}
          precio={precio}
        />
      )}
    </div>
  )
}
