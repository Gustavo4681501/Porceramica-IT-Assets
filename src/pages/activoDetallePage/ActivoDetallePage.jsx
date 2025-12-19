import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Timestamp } from "firebase/firestore"
import { obtenerActivo, agregarPropietario } from "../../services/activos.service"
import ModalFirma from "../../components/ModalFirma"
import "./ActivoDetallePage.css"

export default function ActivoDetallePage() {
  const { id } = useParams()

  const [activo, setActivo] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")
  const [loading, setLoading] = useState(false)

  const cargarActivo = useCallback(async () => {
    const data = await obtenerActivo(id)
    setActivo(data)
  }, [id])

  useEffect(() => {
    cargarActivo()
  }, [cargarActivo])

  const abrirFirma = () => {
    if (!nombreInput || !idInput) {
      alert("Completa nombre e identificación")
      return
    }
    setModalAbierto(true)
  }

  const guardarPropietario = async (firmaBase64) => {
    if (!firmaBase64) return

    setLoading(true)

    const propietarioData = {
      nombre: nombreInput,
      identificacion: idInput,
      fechaAsignacion: Timestamp.now(),
      firmaBase64,
    }

    await agregarPropietario(id, propietarioData)

    setNombreInput("")
    setIdInput("")
    setModalAbierto(false)
    setLoading(false)

    await cargarActivo()
  }

  if (!activo) return <div className="loader">Cargando activo...</div>

  return (
    <div className="activo-container">

      {/* HEADER */}
      <div className="activo-header">
        <div>
          <h1>Activo IT</h1>
          <p className="sub">Detalle completo del activo</p>
        </div>
        <span className="badge-serial">
          Serial: {activo.serialNumber}
        </span>
      </div>

      {/* DATOS DEL ACTIVO */}
      <div className="card-detalle">
        <h3> Datos del activo</h3>

        <div className="detalle-grid">
          <div>
            <span>Categoría</span>
            <p>{activo.categoria || "-"}</p>
          </div>

          <div>
            <span>Estado</span>
            <p className={`estado ${activo.estado}`}>
              {activo.estado || "-"}
            </p>
          </div>

          <div>
            <span>Marca</span>
            <p>{activo.marca || "-"}</p>
          </div>

          <div>
            <span>Modelo</span>
            <p>{activo.modelo || "-"}</p>
          </div>

          <div>
            <span>IMEI</span>
            <p>{activo.imei1 || "-"}</p>
          </div>

          <div className="full">
            <span>Observaciones</span>
            <p>{activo.observaciones || "Sin observaciones"}</p>
          </div>

          <div className="full">
            <span>Fecha de creación</span>
            <p>
              {activo.creadoEn?.toDate().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ASIGNAR NUEVO PROPIETARIO */}
      <div className="card-form">
        <h3> Asignar nuevo propietario</h3>

        <input
          placeholder="Nombre completo"
          value={nombreInput}
          onChange={e => setNombreInput(e.target.value)}
        />

        <input
          placeholder="Identificación"
          value={idInput}
          onChange={e => setIdInput(e.target.value)}
        />

        <button onClick={abrirFirma} disabled={loading}>
          Firmar y asignar
        </button>
      </div>

      {/* MODAL FIRMA */}
      {modalAbierto && (
        <ModalFirma
          titulo="Firma del nuevo propietario"
          onClose={() => setModalAbierto(false)}
          onSave={guardarPropietario}
        />
      )}

      {/* PROPIETARIO ACTUAL */}
      {activo.propietarioActual && (
        <div className="card-actual">
          <h3> Propietario actual</h3>
          <p>
            <strong>{activo.propietarioActual.nombre}</strong><br />
            {activo.propietarioActual.identificacion}<br />
            <small>
              {activo.propietarioActual.fechaAsignacion
                ?.toDate()
                .toLocaleString()}
            </small>
          </p>
          <img
            src={activo.propietarioActual.firmaBase64}
            alt="Firma actual"
          />
        </div>
      )}

      {/* HISTORIAL */}
      <h3 className="historial-title"> Historial de propietarios</h3>

      <div className="historial-list">
        {activo.historial_propietarios?.length ? (
          activo.historial_propietarios.map((p, i) => (
            <div key={i} className="historial-card">
              <div>
                <strong>{p.nombre}</strong>
                <span>{p.identificacion}</span>
              </div>
              <small>
                {p.fechaAsignacion?.toDate().toLocaleString()}
              </small>
              <img src={p.firmaBase64} alt="firma" />
            </div>
          ))
        ) : (
          <p>No hay historial</p>
        )}
      </div>

    </div>
  )
}
