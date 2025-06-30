import {
  BookOpen,
  CreditCard,
  GraduationCap,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Slider from 'react-slick';
import {
  Cell,
  Legend,
  Line, // Import Line for line charts
  LineChart, // Import LineChart
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import Card from '../../components/ui/Card';
import {
  classes,
  depenses,
  eleves,
  enseignants,
  paiements
} from '../../data/donneesTemporaires';

const TableauDeBord = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); //Chargements de mes graphes recharts
  }, []);


  // Fonction pour repartir les eleves selon leur genre
  const genderData = useMemo(() => {
    const male = eleves.filter(e => e.sexe === 'M').length;
    const female = eleves.filter(e => e.sexe === 'F').length;
    return [
      { name: 'Garçons', value: male, color: '#4299E1' },
      { name: 'Filles', value: female, color: '#F687B3' }
    ];
  }, [eleves]);


  // Fonctions pour calcluer les depenses par mois 
  const financialData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const data = [];
    for (let i = 11; i >= 0; i--) { // Loop for last 12 months
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) {
        m += 12; // Adjust month to be within 0-11
        y -= 1;   // Go back a year
      }
      data.push({
        name: new Date(y, m, 1).toLocaleString('fr-FR', { month: 'short', year: '2-digit' }), 
        Paiements: 0,
        Dépenses: 0
      });
    }

   
    paiements.forEach(p => {
      const d = new Date(p.date);
      const label = d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      const index = data.findIndex(item => item.name === label);
      if (index !== -1) data[index].Paiements += p.montant;
    });

    depenses.forEach(d => {
      const dt = new Date(d.date);
      const label = dt.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      const index = data.findIndex(i => i.name === label);
      if (index !== -1) data[index].Dépenses += d.montant;
    });
    return data;
  }, [paiements, depenses]);


  // Les KPIs
  const statsCards = useMemo(() => {
    const currentMonthRevenue = paiements.filter(p => {
      const d = new Date(p.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + p.montant, 0);

    return [
      {
        title: 'Élèves inscrits',
        value: eleves.length,
        icon: GraduationCap,
        color: 'bg-gradient-to-br from-blue-500 to-blue-600',
        change: '+12%', // Static for now, would be dynamic in a real app
        changeType: 'positive'
      },
      {
        title: 'Enseignants actifs',
        value: enseignants.length,
        icon: Users,
        color: 'bg-gradient-to-br from-green-500 to-green-600',
        change: '+3%',
        changeType: 'positive'
      },
      {
        title: 'Classes ouvertes',
        value: classes.length,
        icon: BookOpen,
        color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        change: '0%',
        changeType: 'neutral'
      },
      {
        title: `Revenus ce mois`,
        value: `${currentMonthRevenue.toLocaleString('fr-FR')} FCFA`,
        icon: CreditCard,
        color: 'bg-gradient-to-br from-purple-500 to-purple-600',
        change: '+8%',
        changeType: 'positive'
      }
    ];
  }, [eleves, enseignants, classes, paiements]);

 

  // --- les Réglages du Slider---
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "ease-in-out",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 font-sans">
      {/* Header  */}
      <div className="mb-5 animate-fade-in">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-4">
          Tableau de Bord
        </h1>
       
      </div>

      {/* KPI Cards */}
      <section className="mb-12">
        <div className="relative -mx-3">
          <Slider {...sliderSettings}>
            {statsCards.map((stat, idx) => (
              <div key={idx} className="px-3 ">
                <Card className="bg-gradient-to-br from-fleuve-50  to-fleuve-100 p-6 shadow-xl border border-gray-100 rounded-2xl transform hover:scale-[1.03] transition-all duration-300 overflow-hidden relative">
                  
                 <div className=" flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1 font-medium">{stat.title}</p>
                      <p className="text-xl font-extrabold text-gray-900 leading-tight">{stat.value}</p>
                    </div>

                    {/* Icon centered in colored circle */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white ${stat.color} shadow-lg `}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>

                </Card>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"> 
        {/* Repartition par genre */}
        <Card className="lg:col-span-1 p-6 shadow-xl border border-gray-100 rounded-2xl bg-white flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Répartition Garçons / Filles</h2>
          <div style={{ width: '100%', height: '250px' }}>
            {hasMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                        onMouseOver={(e) => {
                          e.currentTarget.setAttribute('transform', `${e.currentTarget.getAttribute('transform')} scale(1.05)`);
                          e.currentTarget.style.filter = 'brightness(1.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.setAttribute('transform', e.currentTarget.getAttribute('transform').replace(' scale(1.05)', ''));
                          e.currentTarget.style.filter = 'none';
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} élèves`, name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)', fontSize: '14px' }}
                    itemStyle={{ padding: '0', margin: '0', color: '#333' }}
                  />
                  <Legend
                    iconType="circle"
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: '15px', fontSize: '14px', color: '#555' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Légende */}
          <div className="mt-4 flex justify-around w-full text-center text-gray-700">
            <div className="flex flex-col items-center">
              <Users className="w-7 h-7 text-pink-600 mb-1" />
              <span className="font-bold text-xl">{genderData[1].value}</span>
              <span className="text-sm">Filles</span>
            </div>

            <div className="flex flex-col items-center">
              <Users className="w-7 h-7 text-indigo-600 mb-1" />
              <span className="font-bold text-xl">{genderData[0].value}</span>
              <span className="text-sm">Garçons</span>
            </div>
          </div>
        </Card>

        {/* Evolution des paiements */}
        <Card className="lg:col-span-1 p-6 shadow-xl border border-gray-100 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Évolution des Paiements</h2>
          <div style={{ width: '100%', height: '280px' }}>
            {hasMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={financialData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis stroke="#cbd5e1" tickFormatter={(value) => `${(value / 1000000).toLocaleString('fr-FR')}M FCFA`} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value) => `${value.toLocaleString('fr-FR')} FCFA`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#333' }} labelStyle={{ color: '#666' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#555' }} />
                  <Line type="monotone" dataKey="Paiements" stroke="#22C55E" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Montant encaissé" /> {/* Brighter green line */}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Evolution des dépenses */}
        <Card className="lg:col-span-1 p-6 shadow-xl border border-gray-100 rounded-2xl bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Évolution des Dépenses</h2>
          <div style={{ width: '100%', height: '280px' }}>
            {hasMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={financialData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#cbd5e1" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis stroke="#cbd5e1" tickFormatter={(value) => `${(value / 1000000).toLocaleString('fr-FR')}M FCFA`} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value) => `${value.toLocaleString('fr-FR')} FCFA`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#333' }} labelStyle={{ color: '#666' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#555' }} />
                  <Line type="monotone" dataKey="Dépenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Montant dépensé" /> {/* Consistent red line */}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TableauDeBord;