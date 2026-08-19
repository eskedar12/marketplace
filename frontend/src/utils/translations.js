// Central translation dictionary for the site's two supported
// languages. Add a key here (in both `en` and `am`) and read it
// anywhere with `const { t } = useLanguage(); t('someKey')`.
//
// English is the source of truth / fallback — see LanguageContext.t().
export const translations = {
  en: {
    // Navbar
    categories: 'Categories',
    electronics: 'Electronics',
    fashion: 'Fashion',
    vehicles: 'Vehicles',
    myListings: 'My Listings',
    cart: 'Cart',
    messages: 'Messages',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Log out',
    login: 'Login',
    register: 'Register',
    sell: 'Sell',
    switchToAmharic: 'አማ',
    switchToEnglish: 'EN',

    // Category dropdown (full list)
    catElectronics: 'Electronics',
    catFurniture: 'Furniture & Home',
    catFashion: 'Fashion',
    catVehicles: 'Vehicles',
    catBooks: 'Books & Education',
    catTools: 'Tools & Equipment',
    catJewelry: 'Jewelry',
    catOffice: 'Office & Business',
    catOther: 'Other',
  },
  am: {
    // Navbar
    categories: 'ምድቦች',
    electronics: 'ኤሌክትሮኒክስ',
    fashion: 'ፋሽን',
    vehicles: 'ተሽከርካሪዎች',
    myListings: 'የኔ ዕቃዎች',
    cart: 'ጋሪ',
    messages: 'መልዕክቶች',
    notifications: 'ማሳወቂያዎች',
    profile: 'መገለጫ',
    logout: 'ውጣ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    sell: 'ሽጥ',
    switchToAmharic: 'አማ',
    switchToEnglish: 'EN',

    // Category dropdown (full list)
    catElectronics: 'ኤሌክትሮኒክስ',
    catFurniture: 'የቤት ዕቃ',
    catFashion: 'ፋሽን',
    catVehicles: 'ተሽከርካሪዎች',
    catBooks: 'መጻሕፍት እና ትምህርት',
    catTools: 'መሳሪያዎች',
    catJewelry: 'ጌጣጌጥ',
    catOffice: 'ቢሮ እና ንግድ',
    catOther: 'ሌላ',
  },
};
