import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';

const Connexion = () => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();

  if (user) {
    const dashboardPath = `/${user.role}/tableau-de-bord`;
    return <Navigate to={dashboardPath} replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.motDePasse);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const comptesDemonstration = [
    { role: 'Admin', email: 'admin@ecole.sn', password: 'admin123', color: 'from-terre-500 to-terre-600' },
    { role: 'Enseignant', email: 'prof@ecole.sn', password: 'prof123', color: 'from-fleuve-500 to-fleuve-600' },
    { role: 'Parent', email: 'parent@ecole.sn', password: 'parent123', color: 'from-acacia-500 to-acacia-600' },
    { role: 'Élève', email: 'eleve@ecole.sn', password: 'eleve123', color: 'from-soleil-500 to-soleil-600' },
    { role: 'Comptable', email: 'comptable@ecole.sn', password: 'comptable123', color: 'from-gray-500 to-gray-600' }
  ];

  const fillDemo = (email, password) => {
    setFormData({ email, motDePasse: password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soleil-50 via-white to-fleuve-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-soleil-400 to-fleuve-500 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-soleil-500 to-fleuve-500 bg-clip-text text-transparent">
            EcoleManager
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Connectez-vous à votre espace
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="p-6 sm:p-8 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-terre-50 border border-terre-200 text-terre-700 px-4 py-3 rounded-lg text-sm animate-slide-down">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <InputField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@ecole.sn"
                required
                className="transition-all duration-200"
              />

              <div className="relative">
                <InputField
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required
                  className="transition-all duration-200"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Se connecter
            </Button>
          </form>
        </Card>

        {/* Comptes de démonstration */}
        <Card className="p-4 sm:p-6 shadow-lg border-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">
            Comptes de démonstration
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {comptesDemonstration.map((compte, index) => (
              <button
                key={index}
                onClick={() => fillDemo(compte.email, compte.password)}
                className="group w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${compte.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {compte.role.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {compte.role}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {compte.email}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Connexion;