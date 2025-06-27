import { Frown } from 'lucide-react'; // Icon for a sad face
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full">
        <Frown className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce" style={{ '--animate-duration': '1s' }} /> {/* Large, red sad face icon with bounce animation */}
        
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Page Non Trouvée
        </h2>
        <p className="text-md text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas. Elle a peut-être été supprimée, renommée ou n'a jamais existé.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <span className="mr-2">&larr;</span> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;