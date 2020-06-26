//
//
//
//
//
//
//
import Requests from './requests';

window.Requests = Requests;
Requests.baseUrl = 'http://localhost:3000';

const ColorsTextMap = {
  lime: 'text-teal-500',
  red: 'text-red-500',
  blue: 'text-blue-500',
  orange: 'text-orange-500',
  purple: 'text-purple-500',
  pink: 'text-pink-500',
  green: 'text-green-500',
  grey: 'text-gray-500',
  sky: 'text-indigo-500',
  yellow: 'text-yellow-500',
};

window.ColorsTextMap = ColorsTextMap;

const ColorsBgMap = {
  lime: 'bg-teal-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  green: 'bg-green-500',
  grey: 'bg-gray-500',
  sky: 'bg-indigo-500',
  yellow: 'bg-yellow-500',
};

window.ColorsBgMap = ColorsBgMap;
