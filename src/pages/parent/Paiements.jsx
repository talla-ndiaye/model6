import {
    AlertCircle,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Eye,
    Receipt,
    Users
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';

import { useAuth } from '../../context/AuthContext';
import { classes, eleves, paiements } from '../../data/donneesTemporaires';

const HistoriquePaiementsParent = () => {
    const { user } = useAuth();
    const [afficherModalRecu, setAfficherModalRecu] = useState(false);
    const [paiementSelectionne, setPaiementSelectionne] = useState(null);
    const [idEnfantSelectionne, setIdEnfantSelectionne] = useState('');

    const mesEnfantsProfiles = useMemo(() => {
        if (!user.enfants || user.enfants.length === 0) return [];
        return eleves.filter(eleve => eleve.parentIds?.includes(user.id));
    }, [user, eleves]);

    const historiquePaiements = useMemo(() => {
        if (!idEnfantSelectionne) return [];
        return paiements.filter(p => p.eleveId === parseInt(idEnfantSelectionne));
    }, [paiements, idEnfantSelectionne]);

    const enfantActuellementSelectionne = useMemo(() => {
        return mesEnfantsProfiles.find(enfant => String(enfant.id) === String(idEnfantSelectionne));
    }, [mesEnfantsProfiles, idEnfantSelectionne]);


    const getNomEleve = (eleveId) => {
        const eleve = eleves.find(e => e.id === eleveId);
        return eleve ? `${eleve.prenom} ${eleve.nom}` : 'Élève inconnu';
    };

    const getNomClasse = (classeId) => {
        const classe = classes.find(c => c.id === classeId);
        return classe ? classe.nom : 'Classe inconnue';
    };

    const kpis = useMemo(() => {
        const totalPaye = historiquePaiements
            .filter(p => p.statut === 'Payé')
            .reduce((sum, p) => sum + p.montant, 0);

        const totalEnAttente = historiquePaiements
            .filter(p => p.statut === 'En attente' || p.statut === 'En retard')
            .reduce((sum, p) => sum + p.montant, 0);

        const totalNombrePaiements = historiquePaiements.length;
        const nombrePaiementsPayes = historiquePaiements.filter(p => p.statut === 'Payé').length;
        const nombrePaiementsEnAttente = historiquePaiements.filter(p => p.statut === 'En attente' || p.statut === 'En retard').length;

        return {
            totalPaye,
            totalEnAttente,
            totalNombrePaiements,
            nombrePaiementsPayes,
            nombrePaiementsEnAttente
        };
    }, [historiquePaiements]);

    const gererApercuRecu = (paiement) => {
        setPaiementSelectionne(paiement);
        setAfficherModalRecu(true);
    };

    const gererTelechargementRecu = (paiement) => {
        const nomEleve = getNomEleve(paiement.eleveId);
        alert(`Fonctionnalité de téléchargement PDF pour le reçu REC-${paiement.id.toString().padStart(4, '0')} (pour ${nomEleve})`);
    };

    const colonnes = [
        {
            header: 'N° Reçu',
            accessor: 'id',
            render: (p) => `REC-${p.id.toString().padStart(4, '0')}`,
        },
        {
            header: 'Type',
            accessor: 'type',
            render: (p) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    p.type === 'Frais de scolarité' ? 'bg-blue-100 text-blue-800' :
                    p.type === 'Cotisation APEL' ? 'bg-green-100 text-green-800' :
                    p.type === 'Activité sportive' ? 'bg-purple-100 text-purple-800' :
                    p.type === 'Contribution voyage scolaire' ? 'bg-indigo-100 text-indigo-800' :
                    p.type === 'Achats fournitures' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {p.type}
                </span>
            )
        },
        {
            header: 'Montant',
            accessor: 'montant',
            render: (p) => `${p.montant.toFixed(2)} Fcfa`,
        },
        {
            header: 'Statut',
            accessor: 'statut',
            render: (p) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    p.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                    p.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {p.statut}
                </span>
            )
        },
        {
            header: 'Date',
            accessor: 'date',
            render: (p) => new Date(p.date).toLocaleDateString('fr-FR'),
        },
        { header: 'Méthode', accessor: 'methode' },
        {
            header: 'Actions',
            accessor: 'actions',
            render: (p) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => gererApercuRecu(p)} icon={Eye}>
                        Aperçu
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => gererTelechargementRecu(p)} icon={Download}>
                        PDF
                    </Button>
                </div>
            )
        }
    ];

    const elementsStatistiques = useMemo(() => [
        { icon: DollarSign, value: kpis.totalPaye.toFixed(2), label: 'Total Payé', color: 'text-blue-700', bg: 'bg-blue-100', borderColor: 'border-blue-500' },
        { icon: Clock, value: kpis.totalEnAttente.toFixed(2), label: 'Total En Attente', color: 'text-orange-700', bg: 'bg-orange-100', borderColor: 'border-orange-500' },
        { icon: CheckCircle, value: kpis.nombrePaiementsPayes, label: 'Paiements Payés', color: 'text-green-700', bg: 'bg-green-100', borderColor: 'border-green-500' },
        { icon: AlertCircle, value: kpis.nombrePaiementsEnAttente, label: 'Paiements en Attente', color: 'text-red-700', bg: 'bg-red-100', borderColor: 'border-red-500' },
    ], [kpis]);

    const reglagesSlider = {
        dots: true,
        infinite: true,
        autoplay:true,
        autoplayspeed:3000,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1, arrows: false } },
        ],
    };

    if (!user.enfants || user.enfants.length === 0) {
        return (
            <div className="space-y-6">
                <Card className="p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun enfant associé</h3>
                    <p className="text-gray-600">
                        Votre compte parent n'est associé à aucun élève.
                        Veuillez contacter l'administration de l'école pour l'associer.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historique des paiements de mes enfants</h1>
                    <p className="text-gray-600">Consultez l'historique des paiements pour vos enfants.</p>
                </div>
            </div>

            <Card className="p-6 shadow-sm">
                <div className="flex items-center space-x-4">
                    <Users className="h-6 w-6 text-blue-600" />
                    <div className="w-full sm:w-64">
                        <label htmlFor="child-select" className="block text-sm font-medium text-gray-700 sr-only">
                            Sélectionner un enfant
                        </label>
                        <select
                            id="child-select"
                            value={idEnfantSelectionne}
                            onChange={(e) => setIdEnfantSelectionne(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        >
                            <option value="">Sélectionner un enfant</option>
                            {mesEnfantsProfiles.map(enfant => (
                                <option key={enfant.id} value={enfant.id}>
                                    {enfant.prenom} {enfant.nom} - {getNomClasse(enfant.classeId)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {idEnfantSelectionne ? (
                <>
                    <div className="relative -mx-3 mb-8">
                        <Slider {...reglagesSlider}>
                            {elementsStatistiques.map((item, idx) => (
                                <div key={idx} className="px-3">
                                    <Card className={`p-4 text-center shadow-md rounded-lg border-b-4 ${item.borderColor} bg-white h-full flex flex-col justify-center`}>
                                        <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${item.bg}`}>
                                            <item.icon className={`w-6 h-6 ${item.color}`} />
                                        </div>
                                        <p className={`text-xl font-extrabold ${item.color} mb-0.5`}>{item.value} {item.label.includes('Total') ? 'Fcfa' : ''}</p>
                                        <p className="text-xs text-gray-600">{item.label}</p>
                                    </Card>
                                </div>
                            ))}
                        </Slider>
                    </div>

                    <Card className="p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                            Historique des paiements de {enfantActuellementSelectionne?.prenom} {enfantActuellementSelectionne?.nom}
                        </h2>
                        {historiquePaiements.length > 0 ? (
                            <Table
                                columns={colonnes}
                                data={historiquePaiements}
                                noDataMessage="Aucun paiement n'a été enregistré pour cet enfant."
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="w-12 h-12 mx-auto mb-4" />
                                <p>Aucun paiement n'a été enregistré pour cet enfant.</p>
                            </div>
                        )}
                    </Card>
                </>
            ) : (
                <Card className="p-12 text-center bg-gray-50 border border-gray-200 shadow-sm">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Historique des paiements</h3>
                    <p className="text-gray-600">
                        Veuillez sélectionner l'un de vos enfants pour consulter son historique de paiements.
                    </p>
                </Card>
            )}


            <Modal
                isOpen={afficherModalRecu}
                onClose={() => setAfficherModalRecu(false)}
                title="Détails du reçu"
                size="md"
            >
                {paiementSelectionne && (
                    <div className="space-y-6 p-4">
                        <div className="text-center border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-900">EcoleManager</h2>
                            <p className="text-gray-600">Établissement scolaire</p>
                            <p className="text-sm text-gray-500">123 Rue de l'École, 75001 Paris</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Informations du reçu</h3>
                                <p><span className="text-gray-600">N° Reçu:</span> <span className="font-medium text-gray-900">REC-{paiementSelectionne.id.toString().padStart(4, '0')}</span></p>
                                <p><span className="text-gray-600">Date:</span> <span className="font-medium text-gray-900">{new Date(paiementSelectionne.date).toLocaleDateString('fr-FR')}</span></p>
                                <p><span className="text-gray-600">Méthode:</span> <span className="font-medium text-gray-900">{paiementSelectionne.methode}</span></p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Informations élève</h3>
                                {(() => {
                                    const eleve = eleves.find(e => e.id === paiementSelectionne.eleveId);
                                    return eleve ? (
                                        <>
                                            <p><span className="text-gray-600">Nom:</span> <span className="font-medium text-gray-900">{eleve.prenom} {eleve.nom}</span></p>
                                            <p><span className="text-gray-600">Email:</span> <span className="font-medium text-gray-900">{eleve.email}</span></p>
                                            <p><span className="text-gray-600">Téléphone:</span> <span className="font-medium text-gray-900">{eleve.telephone}</span></p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500">Non disponible</p>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                            <h3 className="font-semibold text-gray-900 mb-3">Détail du paiement</h3>
                            <div className="flex justify-between border-b border-gray-200 py-2">
                                <span className="text-gray-800">{paiementSelectionne.type}</span>
                                <span className="font-semibold text-gray-900">{paiementSelectionne.montant.toFixed(2)} Fcfa</span>
                            </div>
                            <div className="flex justify-between py-2 font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>{paiementSelectionne.montant.toFixed(2)} Fcfa</span>
                            </div>
                        </div>

                        <div className="text-center pt-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                paiementSelectionne.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                                paiementSelectionne.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                <Receipt className="w-4 h-4 mr-1" />
                                {paiementSelectionne.statut}
                            </span>
                        </div>

                        <div className="flex justify-center pt-6 border-t border-gray-200">
                            <Button variant="outline" onClick={() => gererTelechargementRecu(paiementSelectionne)} icon={Download}>
                                Télécharger PDF
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default HistoriquePaiementsParent;