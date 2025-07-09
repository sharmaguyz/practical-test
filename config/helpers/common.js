const { Country, State } = require('country-state-city');

class CommonHelper {
  static getAllCountries() {
    const countries = Country.getAllCountries();
    if (!countries?.length) {
      throw new Error('No countries found.');
    }
    return countries;
  };
  static getStatesByCountryCode(countryCode) {
    if (!countryCode) {
      throw new Error('Country code is required.');
    }
    const states = State.getStatesOfCountry(countryCode);
    if (!states?.length) {
      throw new Error('No states found for this country.');
    }
    return states;
  };
  static formatDate = (date, format = 'MMM d, yyyy') => {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // Invalid date check

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const padZero = (num) => num < 10 ? `0${num}` : num;

    return format
      .replace('yyyy', d.getFullYear())
      .replace('MMM', months[d.getMonth()])
      .replace('MM', padZero(d.getMonth() + 1))
      .replace('dd', padZero(d.getDate()))
      .replace('d', d.getDate())
      .replace('HH', padZero(d.getHours()))
      .replace('mm', padZero(d.getMinutes()))
      .replace('ss', padZero(d.getSeconds()));
  };
  static getStateNameByStateCode(countryCode, stateCode) {
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state ? state.name : "";
  };
  static getCountryNameByCountryCode(countryCode) {
    const country = Country.getCountryByCode(countryCode);
    return country ? country.name : "";
  }

  static getSlugFromString(str) {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  }

  static generateUsername(userName, courseName, clientCode) {
    if (!userName || !courseName || !clientCode) {
      console.error('Missing required inputs for username generation');
      return '';
    }

    const sanitize = (str) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const userPart = sanitize(userName).substring(0, 3).padEnd(3, 'x');
    const coursePart = sanitize(courseName).substring(0, 3).padEnd(3, 'x');
    const clientPart = sanitize(clientCode).substring(0, 3).padEnd(3, 'x');
    const randomNum = Math.floor(100000 + Math.random() * 900000).toString();
    const username = `${userPart}${coursePart}${clientPart}_${randomNum}`;

    return username;
  }
  static purchasedAt(isoDateString){
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

}

module.exports = CommonHelper;