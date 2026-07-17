import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar si ya está instalada (standalone)
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    )

    // Capturar el evento de instalación
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Detectar si se instaló mientras la app está abierta
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const showInstallToast = useCallback(() => {
    if (isStandalone || !deferredPrompt) return

    toast.info(
      <div>
        <p className="font-semibold mb-1">📲 Instala ERP Dashboard</p>
        <p className="text-sm text-muted-foreground mb-3">
          Accede rápido desde tu pantalla de inicio
        </p>
        <button
          onClick={async () => {
            deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === 'accepted') {
              toast.success('✅ ¡App instalada correctamente!')
            }
            setDeferredPrompt(null)
          }}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Instalar ahora
        </button>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        toastId: 'pwa-install',
        style: { width: '320px' },
      }
    )
  }, [isStandalone, deferredPrompt])

  return {
    isStandalone,
    canInstall: !!deferredPrompt && !isStandalone,
    showInstallToast,
    install: async () => {
      if (!deferredPrompt) return
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        toast.success('✅ ¡App instalada correctamente!')
      }
      setDeferredPrompt(null)
    },
  }
}
