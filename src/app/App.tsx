import { useState, useRef, useEffect } from 'react';
import { Menu, Loader2, AlertCircle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PatientProfile } from './components/PatientProfile';
import { HospitalCard } from './components/HospitalCard';
import { LoginScreen } from './components/LoginScreen';
import { AIAnalysisIndicator } from './components/AIAnalysisIndicator';

// URL del backend (local o producción)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backendcopago-production.up.railway.app';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  data?: {
    specialty?: string;
    priority?: string;
    coverage?: string;
    estimatedCopay?: number;
    recommendedHospital?: string;
    confidence?: number;
    hasRealData?: boolean;
    symptoms?: string;
    doctor?: string;
    deducibleRestante?: number;
    hospitals?: Hospital[];
    planName?: string;
  };
}

interface Patient {
  clientId: string;
  nombre: string;
  plan: string;
  deducibleAnual: number;
  deducibleUsado: number;
}

interface Hospital {
  nombre: string;
  distancia: string;
  precioConsulta: number;
  calificacion: number;
  tieneEspecialidad?: boolean;
  enRed?: boolean;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'profile' | 'settings' | 'hospitals'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiStage, setAiStage] = useState<'analyzing' | 'searching' | 'complete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentSpecialty, setCurrentSpecialty] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogin = async (cedula: string) => {
    setLoginLoading(true);

    try {
      // Simulación de búsqueda de paciente
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock patient data
      const mockPatient: Patient = {
        clientId: 'PAC-001',
        nombre: 'Juan Pérez',
        plan: 'Premium',
        deducibleAnual: 200,
        deducibleUsado: 50,
      };

      setPatient(mockPatient);
      setIsLoggedIn(true);

      // Mensaje de bienvenida
      setMessages([{
        id: '1',
        text: `¡Hola ${mockPatient.nombre}! Veo que tienes el plan ${mockPatient.plan} con 80% de cobertura.\n\nDescribe tus síntomas con tus propias palabras. Puedes escribir como le hablarías a un médico.`,
        isUser: false,
      }]);
    } catch (err) {
      setError('No se pudo encontrar el paciente');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setAiStage('analyzing');

    try {
      // Simular análisis de IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAiStage('searching');
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: patient?.clientId || 'PAC-001',
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al comunicarse con el servidor');
      }

      const data = await response.json();

      setAiStage('complete');
      setCurrentSpecialty(data.specialty || 'Neurología');

      // Datos reales encontrados
      const hasRealData = data.specialty && data.coverage;

      // Preparar hospitales
      const hospitalsData: Hospital[] = hasRealData ? [
        {
          nombre: 'Hospital del Corazón',
          distancia: '2.5 km',
          precioConsulta: 10,
          calificacion: 4.8,
          tieneEspecialidad: true,
          enRed: true,
        },
        {
          nombre: 'Clínica San José',
          distancia: '3.1 km',
          precioConsulta: 12,
          calificacion: 4.9,
          tieneEspecialidad: true,
          enRed: true,
        },
        {
          nombre: 'Centro Médico Integral',
          distancia: '4.5 km',
          precioConsulta: 15,
          calificacion: 4.7,
          tieneEspecialidad: true,
          enRed: true,
        },
      ] : [
        {
          nombre: 'Hospital General Norte',
          distancia: '4.2 km',
          precioConsulta: 80,
          calificacion: 4.2,
          tieneEspecialidad: false,
          enRed: false,
        },
      ];

      setHospitals(hospitalsData);

      // Encontrar el hospital más económico
      const cheapestHospital = hospitalsData.reduce((prev, current) =>
        prev.precioConsulta < current.precioConsulta ? prev : current
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: hasRealData
          ? `✅ ¡Excelente noticia! He analizado tu plan de seguro y encontré la mejor opción para ti.\n\n🎯 Basado en tu plan ${patient?.plan || 'Premium'}, te recomiendo ${cheapestHospital.nombre} porque:\n\n• Es el más económico de tu red: $${cheapestHospital.precioConsulta}\n• Está a solo ${cheapestHospital.distancia}\n• Tiene especialistas en ${data.specialty || 'Neurología'}\n• Calificación: ${cheapestHospital.calificacion}/5\n\nAquí está el desglose completo de tu beneficio:`
          : `⚠️ No encontré esta especialidad en tu red médica.\n\n💡 Basado en el análisis de IA de tus síntomas:`,
        isUser: false,
        data: {
          specialty: data.specialty || 'Neurología',
          symptoms: data.symptoms || 'Migraña probable',
          priority: data.priority || 'Media',
          confidence: data.confidence || 95,
          hasRealData: hasRealData,
          coverage: data.coverage || '80%',
          estimatedCopay: cheapestHospital.precioConsulta,
          doctor: data.doctor || 'Dr. García',
          deducibleRestante: patient ? patient.deducibleAnual - patient.deducibleUsado : 150,
          recommendedHospital: cheapestHospital.nombre,
          hospitals: hospitalsData,
          planName: patient?.plan || 'Premium',
        },
      };

      setMessages(prev => [...prev, botMessage]);

      setTimeout(() => setAiStage(null), 3000);
    } catch (err) {
      setError('No se pudo conectar con el servidor. Mostrando respuesta de ejemplo.');
      setAiStage('complete');
      setCurrentSpecialty('Neurología');

      const mockHospitals: Hospital[] = [
        {
          nombre: 'Hospital del Corazón',
          distancia: '2.5 km',
          precioConsulta: 10,
          calificacion: 4.8,
          tieneEspecialidad: true,
          enRed: true,
        },
        {
          nombre: 'Clínica San José',
          distancia: '3.1 km',
          precioConsulta: 12,
          calificacion: 4.9,
          tieneEspecialidad: true,
          enRed: true,
        },
        {
          nombre: 'Centro Médico Integral',
          distancia: '4.5 km',
          precioConsulta: 15,
          calificacion: 4.7,
          tieneEspecialidad: true,
          enRed: true,
        },
      ];

      setHospitals(mockHospitals);

      const mockCheapest = mockHospitals[0];

      const mockBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `✅ ¡Excelente noticia! He analizado tu plan de seguro y encontré la mejor opción para ti.\n\n🎯 Basado en tu plan Premium, te recomiendo ${mockCheapest.nombre} porque:\n\n• Es el más económico de tu red: $${mockCheapest.precioConsulta}\n• Está a solo ${mockCheapest.distancia}\n• Tiene especialistas en Neurología\n• Calificación: ${mockCheapest.calificacion}/5\n\nAquí está el desglose completo de tu beneficio:`,
        isUser: false,
        data: {
          specialty: 'Neurología',
          symptoms: 'Migraña probable',
          priority: 'Media',
          confidence: 95,
          hasRealData: true,
          coverage: '80%',
          estimatedCopay: mockCheapest.precioConsulta,
          doctor: 'Dr. García',
          deducibleRestante: 150,
          recommendedHospital: mockCheapest.nombre,
          hospitals: mockHospitals,
          planName: 'Premium',
        },
      };

      setMessages(prev => [...prev, mockBotMessage]);

      setTimeout(() => setAiStage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} isLoading={loginLoading} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="flex-1 flex flex-col h-screen">
        <header className="bg-card border-b border-border px-4 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-muted rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-medium">Agentico de Copago y Cobertura</h1>
            <p className="text-sm text-muted-foreground">Asistente médico inteligente</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#27AE60]/10 text-[#27AE60] rounded-full">
            <div className="w-2 h-2 bg-[#27AE60] rounded-full animate-pulse" />
            <span className="text-sm">En línea</span>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 flex flex-col overflow-hidden">
            {activeView === 'chat' && (
              <>
                {error && (
                  <div className="mx-4 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800">{error}</p>
                      <p className="text-xs text-yellow-600 mt-1">Asegúrate de que el backend esté ejecutándose en /api/chat</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 lg:pb-6">
                  <div className="max-w-4xl mx-auto">
                    {messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg.text}
                        isUser={msg.isUser}
                        data={msg.data}
                      />
                    ))}

                    {aiStage && (
                      <div className="mb-4">
                        <AIAnalysisIndicator
                          stage={aiStage}
                          confidence={95}
                          hasRealData={aiStage === 'complete'}
                        />
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="border-t border-border px-4 py-4 bg-card">
                  <div className="max-w-4xl mx-auto">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                  </div>
                </div>
              </>
            )}

            {activeView === 'profile' && (
              <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 lg:pb-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="mb-6">Perfil del Paciente</h2>
                  <PatientProfile patient={patient} />
                </div>
              </div>
            )}

            {activeView === 'hospitals' && (
              <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 lg:pb-6">
                <div className="max-w-4xl mx-auto">
                  <h2 className="mb-2">
                    {hospitals.some(h => h.enRed) ? '🏥 Hospitales en tu red' : '🏥 Hospitales cercanos'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {currentSpecialty && `Especialidad: ${currentSpecialty}`}
                  </p>

                  {hospitals.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Describe tus síntomas para encontrar hospitales
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hospitals.map((hospital, idx) => (
                        <HospitalCard
                          key={idx}
                          hospital={hospital}
                          specialty={currentSpecialty}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="flex-1 overflow-y-auto px-4 py-6 pb-20 lg:pb-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="mb-6">Configuración</h2>
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-muted-foreground">Configuración del sistema</p>
                  </div>
                </div>
              </div>
            )}
          </main>

          <aside className="hidden xl:block w-80 border-l border-border overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="mb-4">Perfil del Paciente</h3>
              <PatientProfile patient={patient} />
            </div>

            {hospitals.length > 0 && (
              <div>
                <h3 className="mb-4">
                  {hospitals.some(h => h.enRed) ? '🏥 Hospitales RED' : '🏥 Hospitales'}
                </h3>
                <div className="space-y-3">
                  {hospitals.slice(0, 2).map((hospital, idx) => (
                    <HospitalCard
                      key={idx}
                      hospital={hospital}
                      specialty={currentSpecialty}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />
    </div>
  );
}