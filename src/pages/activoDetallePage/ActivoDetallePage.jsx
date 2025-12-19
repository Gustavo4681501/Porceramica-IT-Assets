import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Timestamp } from "firebase/firestore"
import {
  obtenerActivo,
  actualizarActivo,
  agregarPropietario
} from "../../services/activos.service"
import ModalFirma from "../../components/ModalFirma"
import "bootstrap/dist/css/bootstrap.min.css"
import "./ActivoDetallePage.css"

export default function ActivoDetallePage() {
  const { id } = useParams()

  const [activo, setActivo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalAbierto, setModalAbierto] = useState(false)

  const [editandoDatos, setEditandoDatos] = useState(false)
  const [editandoAccesorios, setEditandoAccesorios] = useState(false)

  const [estado, setEstado] = useState("")
  const [precio, setPrecio] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const [accesorios, setAccesorios] = useState({})
  const [lineaNumero, setLineaNumero] = useState("")
  const [lineaPlan, setLineaPlan] = useState(false)

  const [nombreInput, setNombreInput] = useState("")
  const [idInput, setIdInput] = useState("")

  const cargarActivo = useCallback(async () => {
    const data = await obtenerActivo(id)
    setActivo(data)
    setEstado(data.estado || "")
    setPrecio(data.precio || "")
    setObservaciones(data.observaciones || "")
    setAccesorios(data.accesorios || {})
    setLineaNumero(data.accesorios?.lineaNumero || "")
    setLineaPlan(data.accesorios?.lineaPlan || false)
  }, [id])

  useEffect(() => {
    cargarActivo()
  }, [cargarActivo])

  const guardarDatos = async () => {
    setLoading(true)
    await actualizarActivo(id, { estado, precio, observaciones })
    setEditandoDatos(false)
    setLoading(false)
    cargarActivo()
  }

  const guardarAccesorios = async () => {
    setLoading(true)
    await actualizarActivo(id, {
      accesorios: {
        ...accesorios,
        lineaNumero: accesorios.linea ? lineaNumero : null,
        lineaPlan: accesorios.linea ? lineaPlan : null
      }
    })
    setEditandoAccesorios(false)
    setLoading(false)
    cargarActivo()
  }

  const abrirFirma = () => {
    if (!nombreInput && !idInput) return
    setModalAbierto(true)
  }

  const guardarPropietario = async (firmaBase64) => {
    const propietarioData = {
      nombre: nombreInput || "Sin nombre",
      identificacion: idInput || "Sin ID",
      fechaAsignacion: Timestamp.now(),
      firmaBase64
    }
    await agregarPropietario(id, propietarioData)
    setModalAbierto(false)
    setNombreInput("")
    setIdInput("")
    cargarActivo()
  }

  if (!activo) return <div className="loader">Cargando activo...</div>

  return (
    <div className="container my-4">

      {/* HEADER */}
      <div className="activo-header-pro">
        <div>
          <h1>{activo.marca} {activo.modelo}</h1>
          <span className={`estado-pill ${estado}`}>
            {estado.replace("_", " ")}
          </span>
        </div>
        <div className="serial-box">
          <small>Serial</small>
          <strong>{activo.serialNumber}</strong>
        </div>
      </div>

      {/* RESUMEN */}
      <div className="resumen-grid">
        <div>
          <small>Precio</small>
          <h3>${Number(precio || 0).toLocaleString()}</h3>
        </div>
        <div>
          <small>IMEI</small>
          <p>{activo.imei1 || "-"}</p>
        </div>
        <div>
          <small>Creado</small>
          <p>{activo.creadoEn?.toDate().toLocaleDateString()}</p>
        </div>
      </div>

      {/* DATOS */}
      <div className="card-detalle">
        <div className="section-header">
          <h4>Datos del activo</h4>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setEditandoDatos(!editandoDatos)}
          >
            ✏️ Editar
          </button>
        </div>

        {editandoDatos ? (
          <>
            <select
              className="form-select mb-2"
              value={estado}
              onChange={e => setEstado(e.target.value)}
            >
              <option value="asignado">Asignado</option>
              <option value="en_bodega">En bodega</option>
              <option value="danado">Dañado</option>
              <option value="en_reparacion">En reparación</option>
              <option value="baja">Baja</option>
            </select>

            <input
              className="form-control mb-2"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
            />

            <textarea
              className="form-control mb-3"
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
            />

            <button
              className="btn btn-success"
              onClick={guardarDatos}
              disabled={loading}
            >
              Guardar
            </button>
          </>
        ) : (
          <>
            <p><strong>Estado:</strong> {estado}</p>
            <p><strong>Observaciones:</strong> {observaciones || "-"}</p>
          </>
        )}
      </div>

      {/* ACCESORIOS */}
      <div className="card-detalle">
        <div className="section-header">
          <h4>Accesorios</h4>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setEditandoAccesorios(!editandoAccesorios)}
          >
            ✏️ Editar
          </button>
        </div>

       {editandoAccesorios ? (
  <>
    <div className="accesorios-grid">
      {Object.keys(accesorios).map(a => (
        <div key={a} style={{ display: "flex", flexDirection: "column" }}>
          <label>
            <input
              type="checkbox"
              checked={accesorios[a]}
              onChange={() =>
                setAccesorios(p => ({ ...p, [a]: !p[a] }))
              }
            />
            {a.toUpperCase()}
          </label>

          {/* INPUT Y PLAN SI ES LINEA */}
          {a === "linea" && accesorios.linea && (
            <div style={{ marginTop: "0.5rem", width: "100%" }}>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Número de línea"
                value={lineaNumero}
                onChange={e => setLineaNumero(e.target.value)}
                style={{ width: "100%" }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={lineaPlan}
                  onChange={e => setLineaPlan(e.target.checked)}
                />
                Con plan
              </label>
            </div>
          )}
        </div>
      ))}
    </div>

    <button
      className="btn btn-success mt-3"
      onClick={guardarAccesorios}
    >
      Guardar
    </button>
  </>
) : (
  <div className="accesorios-chips">
    {Object.entries(accesorios).map(([k, v]) => (
      <span key={k} className={`chip ${v ? "on" : "off"}`}>
        {k.toUpperCase()}
      </span>
    ))}
  </div>
)}

      </div>

      {/* ASIGNAR PROPIETARIO */}
      <div className="card-form">
        <h5>Asignar propietario</h5>
        <input
          placeholder="Nombre"
          value={nombreInput}
          onChange={e => setNombreInput(e.target.value)}
        />
        <input
          placeholder="Identificación"
          value={idInput}
          onChange={e => setIdInput(e.target.value)}
        />
        <button onClick={abrirFirma}>Firmar y asignar</button>
      </div>

      {modalAbierto && (
        <ModalFirma
          titulo="Firma del propietario"
          onClose={() => setModalAbierto(false)}
          onSave={guardarPropietario}
        />
      )}

      {/* PROPIETARIO ACTUAL */}
      {activo.propietarioActual && (
        <div className="prop-card">
          <div>
            <strong>{activo.propietarioActual.nombre}</strong>
            <small>{activo.propietarioActual.identificacion}</small>
            <small>
              {activo.propietarioActual.fechaAsignacion
                ?.toDate()
                .toLocaleString()}
            </small>
          </div>
          {activo.propietarioActual.firmaBase64 && (
            <img
              src={activo.propietarioActual.firmaBase64}
              alt="firma"
            />
          )}
        </div>
      )}

      {/* HISTORIAL */}
      <div className="card-detalle">
        <h4 className="mb-3">Historial de propietarios</h4>

        {activo.historial_propietarios?.length ? (
          <div className="historial-grid">
            {activo.historial_propietarios.map((p, i) =>
              p ? (
                <div key={i} className="historial-card">
                  <div className="historial-head">
                    <strong>{p.nombre || "Sin nombre"}</strong>
                    <span>{p.identificacion || "Sin ID"}</span>
                  </div>
                  <small>
                    {p.fechaAsignacion?.toDate().toLocaleString() || "-"}
                  </small>
                  {p.firmaBase64 && (
                    <img src={p.firmaBase64} alt="firma" />
                  )}
                </div>
              ) : null
            )}
          </div>
        ) : (
          <p className="text-muted">No hay historial de propietarios</p>
        )}
      </div>
    </div>
  )
}
