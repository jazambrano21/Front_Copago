import { useState } from 'react';
import { Loader2, Bot } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (cedula: string) => void;
  isLoading: boolean;
}

export function LoginScreen({ onLogin, isLoading }: LoginScreenProps) {
  const [cedula, setCedula] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cedula.trim()) {
      onLogin(cedula);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2E86AB] to-[#27AE60] p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#2E86AB] to-[#27AE60] rounded-full flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl">Agentico de Copago y Cobertura</h1>
            <p className="text-muted-foreground">
              🤖 Tu asistente médico con inteligencia artificial
            </p>
          </div>

          <div className="bg-muted rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <Bot className="w-6 h-6 text-[#27AE60] flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm">
                  "Hola, soy tu asistente médico con IA.
                </p>
                <p className="text-sm mt-1">
                  ¿Cuál es tu número de cédula?"
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="1701234567"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E86AB] disabled:opacity-50 text-center text-lg"
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !cedula.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#2E86AB] to-[#27AE60] text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando tu información... 🔍</span>
                </>
              ) : (
                <span>Iniciar Consulta</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
