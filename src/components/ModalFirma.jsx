import { useRef, useEffect } from "react"

export default function ModalFirma({ onClose, onSave }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)

  const start = e => {
    drawingRef.current = true
    const ctx = canvasRef.current.getContext("2d")
    ctx.beginPath()
    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    )
  }

  const stop = () => {
    drawingRef.current = false
  }

  const draw = e => {
    if (!drawingRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    )
    ctx.stroke()
  }

  const guardar = () => {
    const dataURL = canvasRef.current.toDataURL("image/png")
    onSave(dataURL)
  }

  const limpiarFirma = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext("2d")
    ctx.lineWidth = 2
    ctx.strokeStyle = "#000"
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
  }, [])

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(255,255,255,0.95)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ border: "1px solid black", touchAction: "none" }}
        onMouseDown={start}
        onMouseUp={stop}
        onMouseMove={draw}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchEnd={stop}
        onTouchMove={draw}
      />

      <div style={{ position: "absolute", bottom: "20px" }}>
        <button className="btn btn-secondary me-2" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-warning me-2" onClick={limpiarFirma}>
          🔄 Limpiar firma
        </button>
        <button className="btn btn-success" onClick={guardar}>
          Guardar firma
        </button>
      </div>
    </div>
  )
}
