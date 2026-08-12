import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function FaceAuth() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const snapshotUrl = useMemo(
    () => (snapshot ? URL.createObjectURL(snapshot) : null),
    [snapshot]
  )

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const startCamera = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch {
      setError('Camera access denied. Use the file upload instead.')
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) setSnapshot(blob)
    }, 'image/jpeg', 0.9)
    stopCamera()
  }

  const onFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSnapshot(file)
      setError(null)
    }
  }

  const verify = async () => {
    if (!snapshot) return
    setLoading(true)
    setResult(null)
    setError(null)

    const form = new FormData()
    form.append('selfie', snapshot, 'selfie.jpg')

    try {
      const res = await fetch('/api/auth/verify-face', { method: 'POST', body: form })
      setResult(await res.json())
    } catch {
      setError('Failed to reach the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="face-auth">
      <h1>Face Authentication</h1>

      <div className="face-preview">
        {snapshot ? (
          snapshotUrl && <img src={snapshotUrl} alt="Selfie preview" />
        ) : cameraOn ? (
          <video ref={videoRef} autoPlay muted playsInline />
        ) : (
          <p className="placeholder">Start camera or upload a selfie</p>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className="face-actions">
        {cameraOn ? (
          <button onClick={capture}>Capture</button>
        ) : (
          <>
            <button onClick={startCamera} disabled={loading}>
              Start Camera
            </button>
            <label className="file-label">
              Upload selfie
              <input type="file" accept="image/*" onChange={onFileChange} hidden />
            </label>
          </>
        )}
        {snapshot && <button onClick={() => setSnapshot(null)}>Retake</button>}
        <button onClick={verify} disabled={!snapshot || loading}>
          {loading ? 'Verifying...' : 'Authenticate'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          {result.success ? (
            <p className="success">
              Verified as {result.data.user.fullName}
            </p>
          ) : (
            <p className="error">{result.message}</p>
          )}
        </div>
      )}
    </section>
  )
}

export default FaceAuth
