import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { User } from '@supabase/supabase-js';
import type { Review } from '../app/page';

interface ReviewFormProps {
  onSubmit: (review: Omit<Review, 'user_email'>) => void;
  user: User | null;
}

export default function ReviewForm({ onSubmit, user }: ReviewFormProps) {
  const [form, setForm] = useState<Omit<Review, 'user_email' | 'user_name'>>({
    barber_id: 0,
    barber_name: '',
    shop_name: '',
    location: '',
    service_type: 'haircut',
    rating: 5,
    cost: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    review_text: '',
    is_public: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setForm({ ...form, [name]: target.checked });
    } else if (name === 'rating') {
      setForm({ ...form, [name]: parseInt(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  // Confetti celebration function
  function celebrateReview() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !user.email) {
      alert('You must be logged in to post a review.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/createReview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          user_email: user.email,
          user_name: user.email.split('@')[0] // Use email prefix as display name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post review');
      }

      // Success! Celebrate with confetti
      celebrateReview();
      setShowSuccess(true);
      
      // Hide success message after 4 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);

      onSubmit(form);
      setForm({ 
        barber_id: 0,
        barber_name: '', 
        shop_name: '',
        location: '', 
        service_type: 'haircut',
        rating: 5,
        cost: '',
        date: new Date().toISOString().split('T')[0],
        title: '',
        review_text: '',
        is_public: true
      });
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error posting review:', error);
      alert('Failed to post review: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsSubmitting(false);
    }
  }

  const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors duration-200`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-pulse">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Review posted successfully! ⭐🎉</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="barber_name" className="block text-sm font-medium text-gray-700 mb-2">
              Barber Name
            </label>
            <input
              id="barber_name"
              name="barber_name"
              type="text"
              value={form.barber_name}
              onChange={handleChange}
              required
              placeholder="John Smith"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              id="shop_name"
              name="shop_name"
              type="text"
              value={form.shop_name}
              onChange={handleChange}
              required
              placeholder="The Classic Barber Shop"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <select
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a city...</option>
              {/* Major US Cities by State */}
              <optgroup label="Alabama">
                <option value="Anniston, AL">Anniston</option>
                <option value="Auburn, AL">Auburn</option>
                <option value="Bessemer, AL">Bessemer</option>
                <option value="Birmingham, AL">Birmingham</option>
                <option value="Decatur, AL">Decatur</option>
                <option value="Dothan, AL">Dothan</option>
                <option value="Florence, AL">Florence</option>
                <option value="Gadsden, AL">Gadsden</option>
                <option value="Hoover, AL">Hoover</option>
                <option value="Huntsville, AL">Huntsville</option>
                <option value="Madison, AL">Madison</option>
                <option value="Mobile, AL">Mobile</option>
                <option value="Montgomery, AL">Montgomery</option>
                <option value="Opelika, AL">Opelika</option>
                <option value="Phenix City, AL">Phenix City</option>
                <option value="Prattville, AL">Prattville</option>
                <option value="Tuscaloosa, AL">Tuscaloosa</option>
                <option value="Vestavia Hills, AL">Vestavia Hills</option>
              </optgroup>
              <optgroup label="Alaska">
                <option value="Anchorage, AK">Anchorage</option>
                <option value="Bethel, AK">Bethel</option>
                <option value="Fairbanks, AK">Fairbanks</option>
                <option value="Juneau, AK">Juneau</option>
                <option value="Kenai, AK">Kenai</option>
                <option value="Ketchikan, AK">Ketchikan</option>
                <option value="Kodiak, AK">Kodiak</option>
                <option value="Palmer, AK">Palmer</option>
                <option value="Sitka, AK">Sitka</option>
                <option value="Wasilla, AK">Wasilla</option>
              </optgroup>
              <optgroup label="Arizona">
                <option value="Apache Junction, AZ">Apache Junction</option>
                <option value="Avondale, AZ">Avondale</option>
                <option value="Buckeye, AZ">Buckeye</option>
                <option value="Bullhead City, AZ">Bullhead City</option>
                <option value="Casa Grande, AZ">Casa Grande</option>
                <option value="Chandler, AZ">Chandler</option>
                <option value="Flagstaff, AZ">Flagstaff</option>
                <option value="Gilbert, AZ">Gilbert</option>
                <option value="Glendale, AZ">Glendale</option>
                <option value="Goodyear, AZ">Goodyear</option>
                <option value="Lake Havasu City, AZ">Lake Havasu City</option>
                <option value="Maricopa, AZ">Maricopa</option>
                <option value="Mesa, AZ">Mesa</option>
                <option value="Oro Valley, AZ">Oro Valley</option>
                <option value="Peoria, AZ">Peoria</option>
                <option value="Phoenix, AZ">Phoenix</option>
                <option value="Prescott, AZ">Prescott</option>
                <option value="Prescott Valley, AZ">Prescott Valley</option>
                <option value="Scottsdale, AZ">Scottsdale</option>
                <option value="Sierra Vista, AZ">Sierra Vista</option>
                <option value="Surprise, AZ">Surprise</option>
                <option value="Tempe, AZ">Tempe</option>
                <option value="Tucson, AZ">Tucson</option>
                <option value="Yuma, AZ">Yuma</option>
              </optgroup>
              <optgroup label="Arkansas">
                <option value="Bella Vista, AR">Bella Vista</option>
                <option value="Benton, AR">Benton</option>
                <option value="Bentonville, AR">Bentonville</option>
                <option value="Blytheville, AR">Blytheville</option>
                <option value="Bryant, AR">Bryant</option>
                <option value="Cabot, AR">Cabot</option>
                <option value="Conway, AR">Conway</option>
                <option value="El Dorado, AR">El Dorado</option>
                <option value="Fayetteville, AR">Fayetteville</option>
                <option value="Fort Smith, AR">Fort Smith</option>
                <option value="Hot Springs, AR">Hot Springs</option>
                <option value="Jacksonville, AR">Jacksonville</option>
                <option value="Jonesboro, AR">Jonesboro</option>
                <option value="Little Rock, AR">Little Rock</option>
                <option value="Maumelle, AR">Maumelle</option>
                <option value="North Little Rock, AR">North Little Rock</option>
                <option value="Paragould, AR">Paragould</option>
                <option value="Pine Bluff, AR">Pine Bluff</option>
                <option value="Rogers, AR">Rogers</option>
                <option value="Russellville, AR">Russellville</option>
                <option value="Searcy, AR">Searcy</option>
                <option value="Sherwood, AR">Sherwood</option>
                <option value="Springdale, AR">Springdale</option>
                <option value="Texarkana, AR">Texarkana</option>
                <option value="Van Buren, AR">Van Buren</option>
              </optgroup>
              <optgroup label="California">
                <option value="Alameda, CA">Alameda</option>
                <option value="Albany, CA">Albany</option>
                <option value="Alhambra, CA">Alhambra</option>
                <option value="Anaheim, CA">Anaheim</option>
                <option value="Antioch, CA">Antioch</option>
                <option value="Apple Valley, CA">Apple Valley</option>
                <option value="Aquebogue, CA">Aquebogue</option>
                <option value="Atherton, CA">Atherton</option>
                <option value="Bakersfield, CA">Bakersfield</option>
                <option value="Baldwin Park, CA">Baldwin Park</option>
                <option value="Bellflower, CA">Bellflower</option>
                <option value="Belmont, CA">Belmont</option>
                <option value="Benicia, CA">Benicia</option>
                <option value="Berkeley, CA">Berkeley</option>
                <option value="Brentwood, CA">Brentwood</option>
                <option value="Brisbane, CA">Brisbane</option>
                <option value="Buena Park, CA">Buena Park</option>
                <option value="Burbank, CA">Burbank</option>
                <option value="Burlingame, CA">Burlingame</option>
                <option value="Calverton, CA">Calverton</option>
                <option value="Camarillo, CA">Camarillo</option>
                <option value="Campbell, CA">Campbell</option>
                <option value="Capitola, CA">Capitola</option>
                <option value="Carlsbad, CA">Carlsbad</option>
                <option value="Carson, CA">Carson</option>
                <option value="Castro Valley, CA">Castro Valley</option>
                <option value="Chico, CA">Chico</option>
                <option value="Chino, CA">Chino</option>
                <option value="Chino Hills, CA">Chino Hills</option>
                <option value="Chula Vista, CA">Chula Vista</option>
                <option value="Citrus Heights, CA">Citrus Heights</option>
                <option value="Clovis, CA">Clovis</option>
                <option value="Compton, CA">Compton</option>
                <option value="Concord, CA">Concord</option>
                <option value="Corona, CA">Corona</option>
                <option value="Costa Mesa, CA">Costa Mesa</option>
                <option value="Crockett, CA">Crockett</option>
                <option value="Cupertino, CA">Cupertino</option>
                <option value="Cutchogue, CA">Cutchogue</option>
                <option value="Daly City, CA">Daly City</option>
                <option value="Danville, CA">Danville</option>
                <option value="Davis, CA">Davis</option>
                <option value="Downey, CA">Downey</option>
                <option value="Dublin, CA">Dublin</option>
                <option value="East Palo Alto, CA">East Palo Alto</option>
                <option value="El Cajon, CA">El Cajon</option>
                <option value="El Cerrito, CA">El Cerrito</option>
                <option value="El Monte, CA">El Monte</option>
                <option value="Elk Grove, CA">Elk Grove</option>
                <option value="Emeryville, CA">Emeryville</option>
                <option value="Escondido, CA">Escondido</option>
                <option value="Fairfield, CA">Fairfield</option>
                <option value="Folsom, CA">Folsom</option>
                <option value="Fontana, CA">Fontana</option>
                <option value="Foster City, CA">Foster City</option>
                <option value="Fremont, CA">Fremont</option>
                <option value="Fresno, CA">Fresno</option>
                <option value="Fullerton, CA">Fullerton</option>
                <option value="Garden Grove, CA">Garden Grove</option>
                <option value="Gilroy, CA">Gilroy</option>
                <option value="Glendale, CA">Glendale</option>
                <option value="Half Moon Bay, CA">Half Moon Bay</option>
                <option value="Hawthorne, CA">Hawthorne</option>
                <option value="Hayward, CA">Hayward</option>
                <option value="Hemet, CA">Hemet</option>
                <option value="Hercules, CA">Hercules</option>
                <option value="Hesperia, CA">Hesperia</option>
                <option value="Hillsborough, CA">Hillsborough</option>
                <option value="Hollister, CA">Hollister</option>
                <option value="Huntington Beach, CA">Huntington Beach</option>
                <option value="Indio, CA">Indio</option>
                <option value="Inglewood, CA">Inglewood</option>
                <option value="Irvine, CA">Irvine</option>
                <option value="Jamesport, CA">Jamesport</option>
                <option value="Jurupa Valley, CA">Jurupa Valley</option>
                <option value="La Habra, CA">La Habra</option>
                <option value="Lafayette, CA">Lafayette</option>
                <option value="Laguna Niguel, CA">Laguna Niguel</option>
                <option value="Lakewood, CA">Lakewood</option>
                <option value="Lancaster, CA">Lancaster</option>
                <option value="Livermore, CA">Livermore</option>
                <option value="Long Beach, CA">Long Beach</option>
                <option value="Los Altos, CA">Los Altos</option>
                <option value="Los Altos Hills, CA">Los Altos Hills</option>
                <option value="Los Angeles, CA">Los Angeles</option>
                <option value="Los Gatos, CA">Los Gatos</option>
                <option value="Lynwood, CA">Lynwood</option>
                <option value="Manteca, CA">Manteca</option>
                <option value="Martinez, CA">Martinez</option>
                <option value="Mattituck, CA">Mattituck</option>
                <option value="Menifee, CA">Menifee</option>
                <option value="Menlo Park, CA">Menlo Park</option>
                <option value="Merced, CA">Merced</option>
                <option value="Millbrae, CA">Millbrae</option>
                <option value="Milpitas, CA">Milpitas</option>
                <option value="Mission Viejo, CA">Mission Viejo</option>
                <option value="Modesto, CA">Modesto</option>
                <option value="Monte Sereno, CA">Monte Sereno</option>
                <option value="Moraga, CA">Moraga</option>
                <option value="Moreno Valley, CA">Moreno Valley</option>
                <option value="Morgan Hill, CA">Morgan Hill</option>
                <option value="Mountain View, CA">Mountain View</option>
                <option value="Murrieta, CA">Murrieta</option>
                <option value="Napa, CA">Napa</option>
                <option value="Newport Beach, CA">Newport Beach</option>
                <option value="Norwalk, CA">Norwalk</option>
                <option value="Novato, CA">Novato</option>
                <option value="Oakland, CA">Oakland</option>
                <option value="Oceanside, CA">Oceanside</option>
                <option value="Ontario, CA">Ontario</option>
                <option value="Orange, CA">Orange</option>
                <option value="Orinda, CA">Orinda</option>
                <option value="Oxnard, CA">Oxnard</option>
                <option value="Pacifica, CA">Pacifica</option>
                <option value="Palo Alto, CA">Palo Alto</option>
                <option value="Palmdale, CA">Palmdale</option>
                <option value="Pasadena, CA">Pasadena</option>
                <option value="Perris, CA">Perris</option>
                <option value="Petaluma, CA">Petaluma</option>
                <option value="Pico Rivera, CA">Pico Rivera</option>
                <option value="Piedmont, CA">Piedmont</option>
                <option value="Pinole, CA">Pinole</option>
                <option value="Pittsburg, CA">Pittsburg</option>
                <option value="Pleasanton, CA">Pleasanton</option>
                <option value="Pomona, CA">Pomona</option>
                <option value="Port Costa, CA">Port Costa</option>
                <option value="Rancho Cordova, CA">Rancho Cordova</option>
                <option value="Rancho Cucamonga, CA">Rancho Cucamonga</option>
                <option value="Redding, CA">Redding</option>
                <option value="Redlands, CA">Redlands</option>
                <option value="Redondo Beach, CA">Redondo Beach</option>
                <option value="Redwood City, CA">Redwood City</option>
                <option value="Rialto, CA">Rialto</option>
                <option value="Richmond, CA">Richmond</option>
                <option value="Riverside, CA">Riverside</option>
                <option value="Rockville, CA">Rockville</option>
                <option value="Rodeo, CA">Rodeo</option>
                <option value="Rohnert Park, CA">Rohnert Park</option>
                <option value="Roseville, CA">Roseville</option>
                <option value="Sacramento, CA">Sacramento</option>
                <option value="Salinas, CA">Salinas</option>
                <option value="San Bernardino, CA">San Bernardino</option>
                <option value="San Buenaventura, CA">San Buenaventura</option>
                <option value="San Carlos, CA">San Carlos</option>
                <option value="San Clemente, CA">San Clemente</option>
                <option value="San Diego, CA">San Diego</option>
                <option value="San Francisco, CA">San Francisco</option>
                <option value="San Jose, CA">San Jose</option>
                <option value="San Leandro, CA">San Leandro</option>
                <option value="San Lorenzo, CA">San Lorenzo</option>
                <option value="San Mateo, CA">San Mateo</option>
                <option value="San Pablo, CA">San Pablo</option>
                <option value="San Rafael, CA">San Rafael</option>
                <option value="San Ramon, CA">San Ramon</option>
                <option value="Santa Ana, CA">Santa Ana</option>
                <option value="Santa Barbara, CA">Santa Barbara</option>
                <option value="Santa Clara, CA">Santa Clara</option>
                <option value="Santa Clarita, CA">Santa Clarita</option>
                <option value="Santa Cruz, CA">Santa Cruz</option>
                <option value="Santa Maria, CA">Santa Maria</option>
                <option value="Santa Monica, CA">Santa Monica</option>
                <option value="Santa Rosa, CA">Santa Rosa</option>
                <option value="Saratoga, CA">Saratoga</option>
                <option value="Scotts Valley, CA">Scotts Valley</option>
                <option value="Simi Valley, CA">Simi Valley</option>
                <option value="South Gate, CA">South Gate</option>
                <option value="South San Francisco, CA">South San Francisco</option>
                <option value="Southold, CA">Southold</option>
                <option value="Stockton, CA">Stockton</option>
                <option value="Sunnyvale, CA">Sunnyvale</option>
                <option value="Temecula, CA">Temecula</option>
                <option value="Thousand Oaks, CA">Thousand Oaks</option>
                <option value="Torrance, CA">Torrance</option>
                <option value="Tracy, CA">Tracy</option>
                <option value="Turlock, CA">Turlock</option>
                <option value="Tustin, CA">Tustin</option>
                <option value="Union City, CA">Union City</option>
                <option value="Upland, CA">Upland</option>
                <option value="Vacaville, CA">Vacaville</option>
                <option value="Vallejo, CA">Vallejo</option>
                <option value="Victorville, CA">Victorville</option>
                <option value="Visalia, CA">Visalia</option>
                <option value="Vista, CA">Vista</option>
                <option value="Walnut Creek, CA">Walnut Creek</option>
                <option value="Watsonville, CA">Watsonville</option>
                <option value="West Covina, CA">West Covina</option>
                <option value="Westminster, CA">Westminster</option>
                <option value="Whittier, CA">Whittier</option>
                <option value="Yorba Linda, CA">Yorba Linda</option>
              </optgroup>
              <optgroup label="Colorado">
                <option value="Arvada, CO">Arvada</option>
                <option value="Aurora, CO">Aurora</option>
                <option value="Boulder, CO">Boulder</option>
                <option value="Broomfield, CO">Broomfield</option>
                <option value="Castle Rock, CO">Castle Rock</option>
                <option value="Centennial, CO">Centennial</option>
                <option value="Colorado Springs, CO">Colorado Springs</option>
                <option value="Commerce City, CO">Commerce City</option>
                <option value="Denver, CO">Denver</option>
                <option value="Durango, CO">Durango</option>
                <option value="Englewood, CO">Englewood</option>
                <option value="Fort Collins, CO">Fort Collins</option>
                <option value="Grand Junction, CO">Grand Junction</option>
                <option value="Greeley, CO">Greeley</option>
                <option value="Highlands Ranch, CO">Highlands Ranch</option>
                <option value="Lakewood, CO">Lakewood</option>
                <option value="Littleton, CO">Littleton</option>
                <option value="Longmont, CO">Longmont</option>
                <option value="Loveland, CO">Loveland</option>
                <option value="Northglenn, CO">Northglenn</option>
                <option value="Parker, CO">Parker</option>
                <option value="Pueblo, CO">Pueblo</option>
                <option value="Thornton, CO">Thornton</option>
                <option value="Westminster, CO">Westminster</option>
                <option value="Wheat Ridge, CO">Wheat Ridge</option>
              </optgroup>
              <optgroup label="Connecticut">
                <option value="Bridgeport, CT">Bridgeport</option>
                <option value="Bristol, CT">Bristol</option>
                <option value="Danbury, CT">Danbury</option>
                <option value="East Hartford, CT">East Hartford</option>
                <option value="Greenwich, CT">Greenwich</option>
                <option value="Hamden, CT">Hamden</option>
                <option value="Hartford, CT">Hartford</option>
                <option value="Manchester, CT">Manchester</option>
                <option value="Meriden, CT">Meriden</option>
                <option value="Middletown, CT">Middletown</option>
                <option value="Milford, CT">Milford</option>
                <option value="New Britain, CT">New Britain</option>
                <option value="New Haven, CT">New Haven</option>
                <option value="Norwalk, CT">Norwalk</option>
                <option value="Stamford, CT">Stamford</option>
                <option value="Stratford, CT">Stratford</option>
                <option value="Wallingford, CT">Wallingford</option>
                <option value="Waterbury, CT">Waterbury</option>
                <option value="West Hartford, CT">West Hartford</option>
                <option value="West Haven, CT">West Haven</option>
              </optgroup>
              <optgroup label="Delaware">
                <option value="Dover, DE">Dover</option>
                <option value="Elsmere, DE">Elsmere</option>
                <option value="Georgetown, DE">Georgetown</option>
                <option value="Middletown, DE">Middletown</option>
                <option value="Milford, DE">Milford</option>
                <option value="New Castle, DE">New Castle</option>
                <option value="Newark, DE">Newark</option>
                <option value="Seaford, DE">Seaford</option>
                <option value="Smyrna, DE">Smyrna</option>
                <option value="Wilmington, DE">Wilmington</option>
              </optgroup>
              <optgroup label="Florida">
                <option value="Altamonte Springs, FL">Altamonte Springs</option>
                <option value="Aventura, FL">Aventura</option>
                <option value="Boca Raton, FL">Boca Raton</option>
                <option value="Bonita Springs, FL">Bonita Springs</option>
                <option value="Boynton Beach, FL">Boynton Beach</option>
                <option value="Bradenton, FL">Bradenton</option>
                <option value="Cape Coral, FL">Cape Coral</option>
                <option value="Clearwater, FL">Clearwater</option>
                <option value="Clermont, FL">Clermont</option>
                <option value="Coconut Creek, FL">Coconut Creek</option>
                <option value="Coral Springs, FL">Coral Springs</option>
                <option value="Davie, FL">Davie</option>
                <option value="Daytona Beach, FL">Daytona Beach</option>
                <option value="Deerfield Beach, FL">Deerfield Beach</option>
                <option value="Delray Beach, FL">Delray Beach</option>
                <option value="Deltona, FL">Deltona</option>
                <option value="Fort Lauderdale, FL">Fort Lauderdale</option>
                <option value="Fort Myers, FL">Fort Myers</option>
                <option value="Gainesville, FL">Gainesville</option>
                <option value="Greenacres, FL">Greenacres</option>
                <option value="Hialeah, FL">Hialeah</option>
                <option value="Hollywood, FL">Hollywood</option>
                <option value="Homestead, FL">Homestead</option>
                <option value="Jacksonville, FL">Jacksonville</option>
                <option value="Jupiter, FL">Jupiter</option>
                <option value="Kendall, FL">Kendall</option>
                <option value="Kissimmee, FL">Kissimmee</option>
                <option value="Lake Worth, FL">Lake Worth</option>
                <option value="Lakeland, FL">Lakeland</option>
                <option value="Largo, FL">Largo</option>
                <option value="Lauderhill, FL">Lauderhill</option>
                <option value="Margate, FL">Margate</option>
                <option value="Melbourne, FL">Melbourne</option>
                <option value="Miami, FL">Miami</option>
                <option value="Miami Beach, FL">Miami Beach</option>
                <option value="Miami Gardens, FL">Miami Gardens</option>
                <option value="Miramar, FL">Miramar</option>
                <option value="North Lauderdale, FL">North Lauderdale</option>
                <option value="North Miami, FL">North Miami</option>
                <option value="North Port, FL">North Port</option>
                <option value="Oakland Park, FL">Oakland Park</option>
                <option value="Ocala, FL">Ocala</option>
                <option value="Orlando, FL">Orlando</option>
                <option value="Palm Bay, FL">Palm Bay</option>
                <option value="Palm Beach Gardens, FL">Palm Beach Gardens</option>
                <option value="Palm Coast, FL">Palm Coast</option>
                <option value="Panama City, FL">Panama City</option>
                <option value="Pensacola, FL">Pensacola</option>
                <option value="Pinecrest, FL">Pinecrest</option>
                <option value="Pinellas Park, FL">Pinellas Park</option>
                <option value="Plantation, FL">Plantation</option>
                <option value="Pompano Beach, FL">Pompano Beach</option>
                <option value="Port St. Lucie, FL">Port St. Lucie</option>
                <option value="Royal Palm Beach, FL">Royal Palm Beach</option>
                <option value="Sanford, FL">Sanford</option>
                <option value="Sarasota, FL">Sarasota</option>
                <option value="Spring Hill, FL">Spring Hill</option>
                <option value="St. Petersburg, FL">St. Petersburg</option>
                <option value="Sunrise, FL">Sunrise</option>
                <option value="Tallahassee, FL">Tallahassee</option>
                <option value="Tamarac, FL">Tamarac</option>
                <option value="Tampa, FL">Tampa</option>
                <option value="Wellington, FL">Wellington</option>
                <option value="West Palm Beach, FL">West Palm Beach</option>
                <option value="Weston, FL">Weston</option>
                <option value="Winter Garden, FL">Winter Garden</option>
                <option value="Winter Haven, FL">Winter Haven</option>
                <option value="Winter Park, FL">Winter Park</option>
              </optgroup>
              <optgroup label="Georgia">
                <option value="Albany, GA">Albany</option>
                <option value="Alpharetta, GA">Alpharetta</option>
                <option value="Athens, GA">Athens</option>
                <option value="Atlanta, GA">Atlanta</option>
                <option value="Augusta, GA">Augusta</option>
                <option value="Columbus, GA">Columbus</option>
                <option value="Douglasville, GA">Douglasville</option>
                <option value="Duluth, GA">Duluth</option>
                <option value="Dunwoody, GA">Dunwoody</option>
                <option value="East Point, GA">East Point</option>
                <option value="Gainesville, GA">Gainesville</option>
                <option value="Hinesville, GA">Hinesville</option>
                <option value="Johns Creek, GA">Johns Creek</option>
                <option value="Kennesaw, GA">Kennesaw</option>
                <option value="Lawrenceville, GA">Lawrenceville</option>
                <option value="Mableton, GA">Mableton</option>
                <option value="Macon, GA">Macon</option>
                <option value="Marietta, GA">Marietta</option>
                <option value="Newnan, GA">Newnan</option>
                <option value="Peachtree City, GA">Peachtree City</option>
                <option value="Peachtree Corners, GA">Peachtree Corners</option>
                <option value="Rome, GA">Rome</option>
                <option value="Roswell, GA">Roswell</option>
                <option value="Sandy Springs, GA">Sandy Springs</option>
                <option value="Savannah, GA">Savannah</option>
                <option value="Smyrna, GA">Smyrna</option>
                <option value="Stockbridge, GA">Stockbridge</option>
                <option value="Sugar Hill, GA">Sugar Hill</option>
                <option value="Valdosta, GA">Valdosta</option>
                <option value="Warner Robins, GA">Warner Robins</option>
              </optgroup>
              <optgroup label="Hawaii">
                <option value="Ewa Beach, HI">Ewa Beach</option>
                <option value="Ewa Gentry, HI">Ewa Gentry</option>
                <option value="Halawa, HI">Halawa</option>
                <option value="Hawaiian Paradise Park, HI">Hawaiian Paradise Park</option>
                <option value="Hilo, HI">Hilo</option>
                <option value="Honolulu, HI">Honolulu</option>
                <option value="Kahului, HI">Kahului</option>
                <option value="Kailua, HI">Kailua</option>
                <option value="Kaneohe, HI">Kaneohe</option>
                <option value="Kihei, HI">Kihei</option>
                <option value="Makakilo, HI">Makakilo</option>
                <option value="Mililani Mauka, HI">Mililani Mauka</option>
                <option value="Mililani Town, HI">Mililani Town</option>
                <option value="Nanakuli, HI">Nanakuli</option>
                <option value="Pearl City, HI">Pearl City</option>
                <option value="Royal Kunia, HI">Royal Kunia</option>
                <option value="Wahiawa, HI">Wahiawa</option>
                <option value="Wailuku, HI">Wailuku</option>
                <option value="Waimalu, HI">Waimalu</option>
                <option value="Waipahu, HI">Waipahu</option>
              </optgroup>
              <optgroup label="Idaho">
                <option value="Blackfoot, ID">Blackfoot</option>
                <option value="Boise, ID">Boise</option>
                <option value="Caldwell, ID">Caldwell</option>
                <option value="Chubbuck, ID">Chubbuck</option>
                <option value="Coeur d'Alene, ID">Coeur d'Alene</option>
                <option value="Eagle, ID">Eagle</option>
                <option value="Garden City, ID">Garden City</option>
                <option value="Hayden, ID">Hayden</option>
                <option value="Idaho Falls, ID">Idaho Falls</option>
                <option value="Jerome, ID">Jerome</option>
                <option value="Kuna, ID">Kuna</option>
                <option value="Lewiston, ID">Lewiston</option>
                <option value="Meridian, ID">Meridian</option>
                <option value="Moscow, ID">Moscow</option>
                <option value="Mountain Home, ID">Mountain Home</option>
                <option value="Nampa, ID">Nampa</option>
                <option value="Pocatello, ID">Pocatello</option>
                <option value="Post Falls, ID">Post Falls</option>
                <option value="Rexburg, ID">Rexburg</option>
                <option value="Twin Falls, ID">Twin Falls</option>
              </optgroup>
              <optgroup label="Illinois">
                <option value="Addison, IL">Addison</option>
                <option value="Arlington Heights, IL">Arlington Heights</option>
                <option value="Aurora, IL">Aurora</option>
                <option value="Bartlett, IL">Bartlett</option>
                <option value="Belleville, IL">Belleville</option>
                <option value="Berwyn, IL">Berwyn</option>
                <option value="Bloomington, IL">Bloomington</option>
                <option value="Bolingbrook, IL">Bolingbrook</option>
                <option value="Buffalo Grove, IL">Buffalo Grove</option>
                <option value="Carol Stream, IL">Carol Stream</option>
                <option value="Carpentersville, IL">Carpentersville</option>
                <option value="Champaign, IL">Champaign</option>
                <option value="Chicago, IL">Chicago</option>
                <option value="Cicero, IL">Cicero</option>
                <option value="Crystal Lake, IL">Crystal Lake</option>
                <option value="Decatur, IL">Decatur</option>
                <option value="DeKalb, IL">DeKalb</option>
                <option value="Des Plaines, IL">Des Plaines</option>
                <option value="Downers Grove, IL">Downers Grove</option>
                <option value="Elgin, IL">Elgin</option>
                <option value="Elmhurst, IL">Elmhurst</option>
                <option value="Evanston, IL">Evanston</option>
                <option value="Hanover Park, IL">Hanover Park</option>
                <option value="Hoffman Estates, IL">Hoffman Estates</option>
                <option value="Joliet, IL">Joliet</option>
                <option value="Lombard, IL">Lombard</option>
                <option value="Moline, IL">Moline</option>
                <option value="Mount Prospect, IL">Mount Prospect</option>
                <option value="Naperville, IL">Naperville</option>
                <option value="Normal, IL">Normal</option>
                <option value="Oak Lawn, IL">Oak Lawn</option>
                <option value="Oak Park, IL">Oak Park</option>
                <option value="Orland Park, IL">Orland Park</option>
                <option value="Palatine, IL">Palatine</option>
                <option value="Peoria, IL">Peoria</option>
                <option value="Plainfield, IL">Plainfield</option>
                <option value="Quincy, IL">Quincy</option>
                <option value="Rock Island, IL">Rock Island</option>
                <option value="Rockford, IL">Rockford</option>
                <option value="Romeoville, IL">Romeoville</option>
                <option value="Schaumburg, IL">Schaumburg</option>
                <option value="Skokie, IL">Skokie</option>
                <option value="Springfield, IL">Springfield</option>
                <option value="Streamwood, IL">Streamwood</option>
                <option value="Tinley Park, IL">Tinley Park</option>
                <option value="Urbana, IL">Urbana</option>
                <option value="Waukegan, IL">Waukegan</option>
                <option value="Wheaton, IL">Wheaton</option>
                <option value="Wheeling, IL">Wheeling</option>
              </optgroup>
              <optgroup label="Indiana">
                <option value="Carmel, IN">Carmel</option>
                <option value="Evansville, IN">Evansville</option>
                <option value="Fishers, IN">Fishers</option>
                <option value="Fort Wayne, IN">Fort Wayne</option>
                <option value="Indianapolis, IN">Indianapolis</option>
                <option value="South Bend, IN">South Bend</option>
              </optgroup>
              <optgroup label="Iowa">
                <option value="Cedar Rapids, IA">Cedar Rapids</option>
                <option value="Davenport, IA">Davenport</option>
                <option value="Des Moines, IA">Des Moines</option>
                <option value="Iowa City, IA">Iowa City</option>
                <option value="Sioux City, IA">Sioux City</option>
              </optgroup>
              <optgroup label="Kansas">
                <option value="Kansas City, KS">Kansas City</option>
                <option value="Olathe, KS">Olathe</option>
                <option value="Overland Park, KS">Overland Park</option>
                <option value="Topeka, KS">Topeka</option>
                <option value="Wichita, KS">Wichita</option>
              </optgroup>
              <optgroup label="Kentucky">
                <option value="Bowling Green, KY">Bowling Green</option>
                <option value="Covington, KY">Covington</option>
                <option value="Lexington, KY">Lexington</option>
                <option value="Louisville, KY">Louisville</option>
                <option value="Owensboro, KY">Owensboro</option>
              </optgroup>
              <optgroup label="Louisiana">
                <option value="Baton Rouge, LA">Baton Rouge</option>
                <option value="Lafayette, LA">Lafayette</option>
                <option value="Lake Charles, LA">Lake Charles</option>
                <option value="New Orleans, LA">New Orleans</option>
                <option value="Shreveport, LA">Shreveport</option>
              </optgroup>
              <optgroup label="Maine">
                <option value="Bangor, ME">Bangor</option>
                <option value="Lewiston, ME">Lewiston</option>
                <option value="Portland, ME">Portland</option>
                <option value="South Portland, ME">South Portland</option>
              </optgroup>
              <optgroup label="Maryland">
                <option value="Annapolis, MD">Annapolis</option>
                <option value="Baltimore, MD">Baltimore</option>
                <option value="Bowie, MD">Bowie</option>
                <option value="Frederick, MD">Frederick</option>
                <option value="Gaithersburg, MD">Gaithersburg</option>
                <option value="Rockville, MD">Rockville</option>
              </optgroup>
              <optgroup label="Massachusetts">
                <option value="Boston, MA">Boston</option>
                <option value="Brockton, MA">Brockton</option>
                <option value="Cambridge, MA">Cambridge</option>
                <option value="Lowell, MA">Lowell</option>
                <option value="New Bedford, MA">New Bedford</option>
                <option value="Quincy, MA">Quincy</option>
                <option value="Springfield, MA">Springfield</option>
                <option value="Worcester, MA">Worcester</option>
              </optgroup>
              <optgroup label="Michigan">
                <option value="Ann Arbor, MI">Ann Arbor</option>
                <option value="Dearborn, MI">Dearborn</option>
                <option value="Detroit, MI">Detroit</option>
                <option value="Flint, MI">Flint</option>
                <option value="Grand Rapids, MI">Grand Rapids</option>
                <option value="Lansing, MI">Lansing</option>
                <option value="Sterling Heights, MI">Sterling Heights</option>
                <option value="Warren, MI">Warren</option>
              </optgroup>
              <optgroup label="Minnesota">
                <option value="Bloomington, MN">Bloomington</option>
                <option value="Duluth, MN">Duluth</option>
                <option value="Minneapolis, MN">Minneapolis</option>
                <option value="Rochester, MN">Rochester</option>
                <option value="Saint Paul, MN">Saint Paul</option>
              </optgroup>
              <optgroup label="Mississippi">
                <option value="Biloxi, MS">Biloxi</option>
                <option value="Gulfport, MS">Gulfport</option>
                <option value="Hattiesburg, MS">Hattiesburg</option>
                <option value="Jackson, MS">Jackson</option>
                <option value="Southaven, MS">Southaven</option>
              </optgroup>
              <optgroup label="Missouri">
                <option value="Columbia, MO">Columbia</option>
                <option value="Independence, MO">Independence</option>
                <option value="Kansas City, MO">Kansas City</option>
                <option value="Springfield, MO">Springfield</option>
                <option value="St. Louis, MO">St. Louis</option>
              </optgroup>
              <optgroup label="Montana">
                <option value="Billings, MT">Billings</option>
                <option value="Bozeman, MT">Bozeman</option>
                <option value="Butte, MT">Butte</option>
                <option value="Great Falls, MT">Great Falls</option>
                <option value="Helena, MT">Helena</option>
                <option value="Missoula, MT">Missoula</option>
              </optgroup>
              <optgroup label="Nebraska">
                <option value="Bellevue, NE">Bellevue</option>
                <option value="Grand Island, NE">Grand Island</option>
                <option value="Lincoln, NE">Lincoln</option>
                <option value="Omaha, NE">Omaha</option>
              </optgroup>
              <optgroup label="Nevada">
                <option value="Carson City, NV">Carson City</option>
                <option value="Henderson, NV">Henderson</option>
                <option value="Las Vegas, NV">Las Vegas</option>
                <option value="North Las Vegas, NV">North Las Vegas</option>
                <option value="Reno, NV">Reno</option>
                <option value="Sparks, NV">Sparks</option>
              </optgroup>
              <optgroup label="New Hampshire">
                <option value="Concord, NH">Concord</option>
                <option value="Dover, NH">Dover</option>
                <option value="Manchester, NH">Manchester</option>
                <option value="Nashua, NH">Nashua</option>
                <option value="Rochester, NH">Rochester</option>
              </optgroup>
              <optgroup label="New Jersey">
                <option value="Edison, NJ">Edison</option>
                <option value="Elizabeth, NJ">Elizabeth</option>
                <option value="Jersey City, NJ">Jersey City</option>
                <option value="Lakewood, NJ">Lakewood</option>
                <option value="Newark, NJ">Newark</option>
                <option value="Paterson, NJ">Paterson</option>
                <option value="Toms River, NJ">Toms River</option>
                <option value="Woodbridge, NJ">Woodbridge</option>
              </optgroup>
              <optgroup label="New Mexico">
                <option value="Albuquerque, NM">Albuquerque</option>
                <option value="Las Cruces, NM">Las Cruces</option>
                <option value="Rio Rancho, NM">Rio Rancho</option>
                <option value="Roswell, NM">Roswell</option>
                <option value="Santa Fe, NM">Santa Fe</option>
              </optgroup>
              <optgroup label="New York">
                <option value="Albany, NY">Albany</option>
                <option value="Buffalo, NY">Buffalo</option>
                <option value="Mount Vernon, NY">Mount Vernon</option>
                <option value="New Rochelle, NY">New Rochelle</option>
                <option value="New York City, NY">New York City</option>
                <option value="Rochester, NY">Rochester</option>
                <option value="Schenectady, NY">Schenectady</option>
                <option value="Syracuse, NY">Syracuse</option>
                <option value="Utica, NY">Utica</option>
                <option value="Yonkers, NY">Yonkers</option>
              </optgroup>
              <optgroup label="North Carolina">
                <option value="Asheville, NC">Asheville</option>
                <option value="Cary, NC">Cary</option>
                <option value="Charlotte, NC">Charlotte</option>
                <option value="Durham, NC">Durham</option>
                <option value="Fayetteville, NC">Fayetteville</option>
                <option value="Greensboro, NC">Greensboro</option>
                <option value="High Point, NC">High Point</option>
                <option value="Raleigh, NC">Raleigh</option>
                <option value="Wilmington, NC">Wilmington</option>
                <option value="Winston-Salem, NC">Winston-Salem</option>
              </optgroup>
              <optgroup label="North Dakota">
                <option value="Bismarck, ND">Bismarck</option>
                <option value="Fargo, ND">Fargo</option>
                <option value="Grand Forks, ND">Grand Forks</option>
                <option value="Minot, ND">Minot</option>
              </optgroup>
              <optgroup label="Ohio">
                <option value="Akron, OH">Akron</option>
                <option value="Canton, OH">Canton</option>
                <option value="Cincinnati, OH">Cincinnati</option>
                <option value="Cleveland, OH">Cleveland</option>
                <option value="Columbus, OH">Columbus</option>
                <option value="Dayton, OH">Dayton</option>
                <option value="Parma, OH">Parma</option>
                <option value="Toledo, OH">Toledo</option>
                <option value="Youngstown, OH">Youngstown</option>
              </optgroup>
              <optgroup label="Oklahoma">
                <option value="Broken Arrow, OK">Broken Arrow</option>
                <option value="Edmond, OK">Edmond</option>
                <option value="Lawton, OK">Lawton</option>
                <option value="Norman, OK">Norman</option>
                <option value="Oklahoma City, OK">Oklahoma City</option>
                <option value="Tulsa, OK">Tulsa</option>
              </optgroup>
              <optgroup label="Oregon">
                <option value="Bend, OR">Bend</option>
                <option value="Eugene, OR">Eugene</option>
                <option value="Gresham, OR">Gresham</option>
                <option value="Hillsboro, OR">Hillsboro</option>
                <option value="Portland, OR">Portland</option>
                <option value="Salem, OR">Salem</option>
              </optgroup>
              <optgroup label="Pennsylvania">
                <option value="Allentown, PA">Allentown</option>
                <option value="Bethlehem, PA">Bethlehem</option>
                <option value="Erie, PA">Erie</option>
                <option value="Lancaster, PA">Lancaster</option>
                <option value="Philadelphia, PA">Philadelphia</option>
                <option value="Pittsburgh, PA">Pittsburgh</option>
                <option value="Reading, PA">Reading</option>
                <option value="Scranton, PA">Scranton</option>
              </optgroup>
              <optgroup label="Rhode Island">
                <option value="Cranston, RI">Cranston</option>
                <option value="Pawtucket, RI">Pawtucket</option>
                <option value="Providence, RI">Providence</option>
                <option value="Warwick, RI">Warwick</option>
              </optgroup>
              <optgroup label="South Carolina">
                <option value="Charleston, SC">Charleston</option>
                <option value="Columbia, SC">Columbia</option>
                <option value="Greenville, SC">Greenville</option>
                <option value="Mount Pleasant, SC">Mount Pleasant</option>
                <option value="North Charleston, SC">North Charleston</option>
                <option value="Rock Hill, SC">Rock Hill</option>
                <option value="Summerville, SC">Summerville</option>
              </optgroup>
              <optgroup label="South Dakota">
                <option value="Aberdeen, SD">Aberdeen</option>
                <option value="Brookings, SD">Brookings</option>
                <option value="Rapid City, SD">Rapid City</option>
                <option value="Sioux Falls, SD">Sioux Falls</option>
                <option value="Watertown, SD">Watertown</option>
              </optgroup>
              <optgroup label="Tennessee">
                <option value="Chattanooga, TN">Chattanooga</option>
                <option value="Clarksville, TN">Clarksville</option>
                <option value="Knoxville, TN">Knoxville</option>
                <option value="Memphis, TN">Memphis</option>
                <option value="Murfreesboro, TN">Murfreesboro</option>
                <option value="Nashville, TN">Nashville</option>
              </optgroup>
              <optgroup label="Texas">
                <option value="Abilene, TX">Abilene</option>
                <option value="Allen, TX">Allen</option>
                <option value="Amarillo, TX">Amarillo</option>
                <option value="Arlington, TX">Arlington</option>
                <option value="Austin, TX">Austin</option>
                <option value="Baytown, TX">Baytown</option>
                <option value="Beaumont, TX">Beaumont</option>
                <option value="Bedford, TX">Bedford</option>
                <option value="Brownsville, TX">Brownsville</option>
                <option value="Brownwood, TX">Brownwood</option>
                <option value="Bryan, TX">Bryan</option>
                <option value="Burleson, TX">Burleson</option>
                <option value="Carrollton, TX">Carrollton</option>
                <option value="Cedar Hill, TX">Cedar Hill</option>
                <option value="Cedar Park, TX">Cedar Park</option>
                <option value="Cleburne, TX">Cleburne</option>
                <option value="College Station, TX">College Station</option>
                <option value="Conroe, TX">Conroe</option>
                <option value="Coppell, TX">Coppell</option>
                <option value="Corpus Christi, TX">Corpus Christi</option>
                <option value="Dallas, TX">Dallas</option>
                <option value="Deer Park, TX">Deer Park</option>
                <option value="Del Rio, TX">Del Rio</option>
                <option value="Denton, TX">Denton</option>
                <option value="DeSoto, TX">DeSoto</option>
                <option value="Duncanville, TX">Duncanville</option>
                <option value="Edinburg, TX">Edinburg</option>
                <option value="El Paso, TX">El Paso</option>
                <option value="Euless, TX">Euless</option>
                <option value="Farmers Branch, TX">Farmers Branch</option>
                <option value="Flower Mound, TX">Flower Mound</option>
                <option value="Fort Worth, TX">Fort Worth</option>
                <option value="Friendswood, TX">Friendswood</option>
                <option value="Frisco, TX">Frisco</option>
                <option value="Galveston, TX">Galveston</option>
                <option value="Garland, TX">Garland</option>
                <option value="Georgetown, TX">Georgetown</option>
                <option value="Grand Prairie, TX">Grand Prairie</option>
                <option value="Grapevine, TX">Grapevine</option>
                <option value="Greenville, TX">Greenville</option>
                <option value="Haltom City, TX">Haltom City</option>
                <option value="Harlingen, TX">Harlingen</option>
                <option value="Houston, TX">Houston</option>
                <option value="Huntsville, TX">Huntsville</option>
                <option value="Hurst, TX">Hurst</option>
                <option value="Irving, TX">Irving</option>
                <option value="Keller, TX">Keller</option>
                <option value="Killeen, TX">Killeen</option>
                <option value="Kingsville, TX">Kingsville</option>
                <option value="La Porte, TX">La Porte</option>
                <option value="Lancaster, TX">Lancaster</option>
                <option value="Laredo, TX">Laredo</option>
                <option value="League City, TX">League City</option>
                <option value="Lewisville, TX">Lewisville</option>
                <option value="Longview, TX">Longview</option>
                <option value="Lubbock, TX">Lubbock</option>
                <option value="Lufkin, TX">Lufkin</option>
                <option value="Mansfield, TX">Mansfield</option>
                <option value="Marshall, TX">Marshall</option>
                <option value="McKinney, TX">McKinney</option>
                <option value="Mesquite, TX">Mesquite</option>
                <option value="Midland, TX">Midland</option>
                <option value="Mission, TX">Mission</option>
                <option value="Missouri City, TX">Missouri City</option>
                <option value="Nacogdoches, TX">Nacogdoches</option>
                <option value="New Braunfels, TX">New Braunfels</option>
                <option value="North Richland Hills, TX">North Richland Hills</option>
                <option value="Odessa, TX">Odessa</option>
                <option value="Palestine, TX">Palestine</option>
                <option value="Paris, TX">Paris</option>
                <option value="Pasadena, TX">Pasadena</option>
                <option value="Pearland, TX">Pearland</option>
                <option value="Pflugerville, TX">Pflugerville</option>
                <option value="Pharr, TX">Pharr</option>
                <option value="Plano, TX">Plano</option>
                <option value="Port Arthur, TX">Port Arthur</option>
                <option value="Richardson, TX">Richardson</option>
                <option value="Rockwall, TX">Rockwall</option>
                <option value="Rosenberg, TX">Rosenberg</option>
                <option value="Round Rock, TX">Round Rock</option>
                <option value="Rowlett, TX">Rowlett</option>
                <option value="San Angelo, TX">San Angelo</option>
                <option value="San Antonio, TX">San Antonio</option>
                <option value="San Marcos, TX">San Marcos</option>
                <option value="Schertz, TX">Schertz</option>
                <option value="Sherman, TX">Sherman</option>
                <option value="Southlake, TX">Southlake</option>
                <option value="Spring, TX">Spring</option>
                <option value="Sugar Land, TX">Sugar Land</option>
                <option value="Temple, TX">Temple</option>
                <option value="Texarkana, TX">Texarkana</option>
                <option value="Texas City, TX">Texas City</option>
                <option value="The Woodlands, TX">The Woodlands</option>
                <option value="Tyler, TX">Tyler</option>
                <option value="University Park, TX">University Park</option>
                <option value="Victoria, TX">Victoria</option>
                <option value="Waco, TX">Waco</option>
                <option value="Weatherford, TX">Weatherford</option>
                <option value="Wichita Falls, TX">Wichita Falls</option>
                <option value="Wylie, TX">Wylie</option>
              </optgroup>
              <optgroup label="New York">
                <option value="New York City, NY">New York City</option>
                <option value="Buffalo, NY">Buffalo</option>
                <option value="Rochester, NY">Rochester</option>
                <option value="Yonkers, NY">Yonkers</option>
                <option value="Syracuse, NY">Syracuse</option>
                <option value="Albany, NY">Albany</option>
                <option value="New Rochelle, NY">New Rochelle</option>
                <option value="Mount Vernon, NY">Mount Vernon</option>
                <option value="Schenectady, NY">Schenectady</option>
                <option value="Utica, NY">Utica</option>
                <option value="White Plains, NY">White Plains</option>
                <option value="Hempstead, NY">Hempstead</option>
                <option value="Troy, NY">Troy</option>
                <option value="Niagara Falls, NY">Niagara Falls</option>
                <option value="Binghamton, NY">Binghamton</option>
                <option value="Freeport, NY">Freeport</option>
                <option value="Valley Stream, NY">Valley Stream</option>
                <option value="Long Beach, NY">Long Beach</option>
                <option value="Rome, NY">Rome</option>
                <option value="Watertown, NY">Watertown</option>
                <option value="Ithaca, NY">Ithaca</option>
                <option value="Cheektowaga, NY">Cheektowaga</option>
                <option value="West Seneca, NY">West Seneca</option>
                <option value="Jamestown, NY">Jamestown</option>
                <option value="Elmira, NY">Elmira</option>
                <option value="Middletown, NY">Middletown</option>
                <option value="Poughkeepsie, NY">Poughkeepsie</option>
                <option value="Levittown, NY">Levittown</option>
                <option value="Hicksville, NY">Hicksville</option>
                <option value="Oceanside, NY">Oceanside</option>
                <option value="East Meadow, NY">East Meadow</option>
                <option value="Uniondale, NY">Uniondale</option>
                <option value="West Babylon, NY">West Babylon</option>
                <option value="Massapequa, NY">Massapequa</option>
                <option value="Commack, NY">Commack</option>
                <option value="Lindenhurst, NY">Lindenhurst</option>
                <option value="West Islip, NY">West Islip</option>
                <option value="Centereach, NY">Centereach</option>
                <option value="Bay Shore, NY">Bay Shore</option>
                <option value="Coram, NY">Coram</option>
                <option value="Central Islip, NY">Central Islip</option>
                <option value="North Babylon, NY">North Babylon</option>
                <option value="Huntington Station, NY">Huntington Station</option>
                <option value="Ronkonkoma, NY">Ronkonkoma</option>
                <option value="Holbrook, NY">Holbrook</option>
                <option value="Deer Park, NY">Deer Park</option>
                <option value="Dix Hills, NY">Dix Hills</option>
                <option value="Melville, NY">Melville</option>
                <option value="Plainview, NY">Plainview</option>
                <option value="Syosset, NY">Syosset</option>
                <option value="Woodbury, NY">Woodbury</option>
                <option value="Jericho, NY">Jericho</option>
                <option value="East Northport, NY">East Northport</option>
                <option value="Kings Park, NY">Kings Park</option>
                <option value="Smithtown, NY">Smithtown</option>
                <option value="Hauppauge, NY">Hauppauge</option>
                <option value="Islip, NY">Islip</option>
                <option value="East Patchogue, NY">East Patchogue</option>
                <option value="Medford, NY">Medford</option>
                <option value="Selden, NY">Selden</option>
                <option value="Lake Grove, NY">Lake Grove</option>
                <option value="Centereach, NY">Centereach</option>
                <option value="Farmingville, NY">Farmingville</option>
                <option value="Holtsville, NY">Holtsville</option>
                <option value="Patchogue, NY">Patchogue</option>
                <option value="Port Jefferson Station, NY">Port Jefferson Station</option>
                <option value="Shirley, NY">Shirley</option>
                <option value="Mastic, NY">Mastic</option>
                <option value="Mastic Beach, NY">Mastic Beach</option>
                <option value="Center Moriches, NY">Center Moriches</option>
                <option value="Eastport, NY">Eastport</option>
                <option value="Speonk, NY">Speonk</option>
                <option value="Westhampton, NY">Westhampton</option>
                <option value="East Quogue, NY">East Quogue</option>
                <option value="Hampton Bays, NY">Hampton Bays</option>
                <option value="Southampton, NY">Southampton</option>
                <option value="East Hampton, NY">East Hampton</option>
                <option value="Montauk, NY">Montauk</option>
                <option value="Riverhead, NY">Riverhead</option>
                <option value="Calverton, NY">Calverton</option>
                <option value="Aquebogue, NY">Aquebogue</option>
                <option value="Jamesport, NY">Jamesport</option>
                <option value="Mattituck, NY">Mattituck</option>
                <option value="Cutchogue, NY">Cutchogue</option>
                <option value="Southold, NY">Southold</option>
                <option value="Greenport, NY">Greenport</option>
                <option value="Shelter Island, NY">Shelter Island</option>
              </optgroup>
              <optgroup label="California (continued)">
                <option value="Napa, CA">Napa</option>
                <option value="Petaluma, CA">Petaluma</option>
                <option value="Rohnert Park, CA">Rohnert Park</option>
                <option value="San Rafael, CA">San Rafael</option>
                <option value="Novato, CA">Novato</option>
                <option value="Benicia, CA">Benicia</option>
                <option value="Martinez, CA">Martinez</option>
                <option value="Brentwood, CA">Brentwood</option>
                <option value="Antioch, CA">Antioch</option>
                <option value="Pittsburg, CA">Pittsburg</option>
                <option value="San Pablo, CA">San Pablo</option>
                <option value="El Cerrito, CA">El Cerrito</option>
                <option value="Albany, CA">Albany</option>
                <option value="Emeryville, CA">Emeryville</option>
                <option value="Piedmont, CA">Piedmont</option>
                <option value="San Lorenzo, CA">San Lorenzo</option>
                <option value="Castro Valley, CA">Castro Valley</option>
                <option value="Dublin, CA">Dublin</option>
                <option value="Danville, CA">Danville</option>
                <option value="Lafayette, CA">Lafayette</option>
                <option value="Orinda, CA">Orinda</option>
                <option value="Moraga, CA">Moraga</option>
                <option value="Pinole, CA">Pinole</option>
                <option value="Hercules, CA">Hercules</option>
                <option value="Rodeo, CA">Rodeo</option>
                <option value="Crockett, CA">Crockett</option>
                <option value="Port Costa, CA">Port Costa</option>
                <option value="Half Moon Bay, CA">Half Moon Bay</option>
                <option value="Pacifica, CA">Pacifica</option>
                <option value="South San Francisco, CA">South San Francisco</option>
                <option value="Brisbane, CA">Brisbane</option>
                <option value="Millbrae, CA">Millbrae</option>
                <option value="Burlingame, CA">Burlingame</option>
                <option value="Hillsborough, CA">Hillsborough</option>
                <option value="Foster City, CA">Foster City</option>
                <option value="Belmont, CA">Belmont</option>
                <option value="San Carlos, CA">San Carlos</option>
                <option value="Atherton, CA">Atherton</option>
                <option value="Menlo Park, CA">Menlo Park</option>
                <option value="East Palo Alto, CA">East Palo Alto</option>
                <option value="Los Altos, CA">Los Altos</option>
                <option value="Los Altos Hills, CA">Los Altos Hills</option>
                <option value="Los Gatos, CA">Los Gatos</option>
                <option value="Monte Sereno, CA">Monte Sereno</option>
                <option value="Saratoga, CA">Saratoga</option>
                <option value="Campbell, CA">Campbell</option>
                <option value="Cupertino, CA">Cupertino</option>
                <option value="Santa Cruz, CA">Santa Cruz</option>
                <option value="Capitola, CA">Capitola</option>
                <option value="Scotts Valley, CA">Scotts Valley</option>
                <option value="Watsonville, CA">Watsonville</option>
                <option value="Hollister, CA">Hollister</option>
                <option value="Gilroy, CA">Gilroy</option>
                <option value="Morgan Hill, CA">Morgan Hill</option>
                <option value="Milpitas, CA">Milpitas</option>
              </optgroup>
              <optgroup label="Utah">
                <option value="Ogden, UT">Ogden</option>
                <option value="Orem, UT">Orem</option>
                <option value="Provo, UT">Provo</option>
                <option value="Salt Lake City, UT">Salt Lake City</option>
                <option value="Sandy, UT">Sandy</option>
                <option value="West Jordan, UT">West Jordan</option>
                <option value="West Valley City, UT">West Valley City</option>
              </optgroup>
              <optgroup label="Vermont">
                <option value="Burlington, VT">Burlington</option>
                <option value="Colchester, VT">Colchester</option>
                <option value="Essex, VT">Essex</option>
                <option value="Rutland, VT">Rutland</option>
                <option value="South Burlington, VT">South Burlington</option>
              </optgroup>
              <optgroup label="Virginia">
                <option value="Alexandria, VA">Alexandria</option>
                <option value="Chesapeake, VA">Chesapeake</option>
                <option value="Hampton, VA">Hampton</option>
                <option value="Newport News, VA">Newport News</option>
                <option value="Norfolk, VA">Norfolk</option>
                <option value="Portsmouth, VA">Portsmouth</option>
                <option value="Richmond, VA">Richmond</option>
                <option value="Suffolk, VA">Suffolk</option>
                <option value="Virginia Beach, VA">Virginia Beach</option>
              </optgroup>
              <optgroup label="Washington">
                <option value="Bellevue, WA">Bellevue</option>
                <option value="Everett, WA">Everett</option>
                <option value="Kent, WA">Kent</option>
                <option value="Renton, WA">Renton</option>
                <option value="Seattle, WA">Seattle</option>
                <option value="Spokane, WA">Spokane</option>
                <option value="Spokane Valley, WA">Spokane Valley</option>
                <option value="Tacoma, WA">Tacoma</option>
                <option value="Vancouver, WA">Vancouver</option>
              </optgroup>
              <optgroup label="West Virginia">
                <option value="Charleston, WV">Charleston</option>
                <option value="Huntington, WV">Huntington</option>
                <option value="Morgantown, WV">Morgantown</option>
                <option value="Parkersburg, WV">Parkersburg</option>
                <option value="Wheeling, WV">Wheeling</option>
              </optgroup>
              <optgroup label="Wisconsin">
                <option value="Appleton, WI">Appleton</option>
                <option value="Green Bay, WI">Green Bay</option>
                <option value="Kenosha, WI">Kenosha</option>
                <option value="Madison, WI">Madison</option>
                <option value="Milwaukee, WI">Milwaukee</option>
                <option value="Racine, WI">Racine</option>
              </optgroup>
              <optgroup label="Wyoming">
                <option value="Casper, WY">Casper</option>
                <option value="Cheyenne, WY">Cheyenne</option>
                <option value="Gillette, WY">Gillette</option>
                <option value="Laramie, WY">Laramie</option>
                <option value="Rock Springs, WY">Rock Springs</option>
              </optgroup>
              <optgroup label="Washington D.C.">
                <option value="Washington, DC">Washington D.C.</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              id="service_type"
              name="service_type"
              value={form.service_type}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="haircut">Haircut</option>
              <option value="beard_trim">Beard Trim</option>
              <option value="shave">Shave</option>
              <option value="haircut_beard">Haircut + Beard</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Service
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
              Cost
            </label>
            <input
              id="cost"
              name="cost"
              type="text"
              value={form.cost}
              onChange={handleChange}
              required
              placeholder="$25"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <StarRating 
            rating={form.rating} 
            onRatingChange={(rating) => setForm({ ...form, rating })}
          />
          <p className="text-sm text-gray-500 mt-1">Click the stars to rate your experience</p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Great fade, excellent service!"
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="review_text" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea 
            id="review_text"
            name="review_text" 
            value={form.review_text} 
            onChange={handleChange} 
            required
            placeholder="Tell others about your experience..."
            rows={4}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="is_public"
            name="is_public"
            type="checkbox"
            checked={form.is_public}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
            Make this review public (others can see it)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting Review...
            </div>
          ) : (
            'Post Review'
          )}
        </button>
      </form>
    </div>
  );
}
