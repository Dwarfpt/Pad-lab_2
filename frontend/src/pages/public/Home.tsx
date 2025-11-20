import { Link } from 'react-router-dom';
import { Car, Clock, Shield, Smartphone, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Clock,
      title: t('home.features.realTimeAvailability.title'),
      description: t('home.features.realTimeAvailability.description'),
    },
    {
      icon: Smartphone,
      title: t('home.features.mobileFriendly.title'),
      description: t('home.features.mobileFriendly.description'),
    },
    {
      icon: Shield,
      title: t('home.features.securePayment.title'),
      description: t('home.features.securePayment.description'),
    },
    {
      icon: MapPin,
      title: t('home.features.multipleLocations.title'),
      description: t('home.features.multipleLocations.description'),
    },
    {
      icon: TrendingUp,
      title: t('home.features.dynamicPricing.title'),
      description: t('home.features.dynamicPricing.description'),
    },
    {
      icon: Car,
      title: t('home.features.easyAccess.title'),
      description: t('home.features.easyAccess.description'),
    },
  ];

  const stats = [
    { value: '10K+', label: t('home.stats.activeUsers') },
    { value: '50+', label: t('home.stats.parkingLocations') },
    { value: '99.9%', label: t('home.stats.uptime') },
    { value: '24/7', label: t('home.stats.support') },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/parking-slots" 
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 shadow-xl border-2 border-white transition-all hover:scale-105 no-underline"
              >
                {t('home.hero.findParking')}
              </Link>
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 text-lg font-semibold rounded-lg bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary-600 shadow-xl transition-all hover:scale-105 no-underline"
              >
                {t('home.hero.createAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="text-primary-600" size={32} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardContent className="mt-2">{feature.description}</CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.howItWorks.title')}</h2>
            <p className="text-xl text-gray-600">{t('home.howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-gray-600">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-gray-600">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-2xl font-bold mb-2">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-gray-600">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{t('home.cta.title')}</h2>
          <p className="text-xl mb-8 text-primary-100">
            {t('home.cta.subtitle')}
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold rounded-lg bg-white text-primary-600 hover:bg-gray-100 shadow-xl border-2 border-white transition-all hover:scale-105 no-underline"
          >
            {t('home.cta.getStarted')}
          </Link>
          
          {/* Маленькая ссылка для админов */}
          <div className="mt-6">
            <Link 
              to="/admin-login" 
              className="text-sm text-primary-200 hover:text-white underline transition-colors"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
