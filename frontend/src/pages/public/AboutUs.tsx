import { Users, Target, Award, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.mission.title')}</h2>
              <p className="text-lg text-gray-600 mb-4">
                {t('about.mission.description1')}
              </p>
              <p className="text-lg text-gray-600">
                {t('about.mission.description2')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">5000+</h3>
                <p className="text-gray-600">{t('about.stats.customers')}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Target className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">50+</h3>
                <p className="text-gray-600">{t('about.stats.parkings')}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Award className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">3+</h3>
                <p className="text-gray-600">{t('about.stats.experience')}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Heart className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">98%</h3>
                <p className="text-gray-600">{t('about.stats.satisfaction')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('about.values.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.innovation.title')}</h3>
              <p className="text-gray-600">
                {t('about.values.innovation.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.reliability.title')}</h3>
              <p className="text-gray-600">
                {t('about.values.reliability.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.accessibility.title')}</h3>
              <p className="text-gray-600">
                {t('about.values.accessibility.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t('about.team.title')}</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            {t('about.team.description')}
          </p>
          <div className="text-center">
            <p className="text-lg text-gray-600">
              {t('about.contact.description')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
