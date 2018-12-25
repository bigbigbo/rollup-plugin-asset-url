import image from './assets/images/roadmap.png';
import Logo from './components/button';

import './index.css';

const sleep = timerout => new Promise(resolve => setTimeout(resolve, timeout));

export default {
  sleep,
  logo: Logo.logo,
  banner: [image]
};
