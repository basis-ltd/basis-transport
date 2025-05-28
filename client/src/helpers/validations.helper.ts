const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
const isPassword = (value: string) =>
  value.length >= 6 &&
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(value);
const isNumber = (value: string) => /^\d+$/.test(value);
const isText = (value: string) => /^\s*[\s\S]+?\s*$/.test(value);
const isUrl = (value: string) => /(ftp|http|https|www):\/\/[^ "]+$/.test(value);
const isTextarea = (value: string) => /^\s*[\s\S]+?\s*$/.test(value);

const validateInputs = (value: string, type: string) => {
  if (!value) {
    return false;
  }

  switch (type) {
    case 'email':
      return isEmail(value);
    case 'password':
      return isPassword(value);
    case 'number':
      return isNumber(value);
    case 'text':
      return isText(value);
    case 'url':
      return isUrl(value);
    case 'textarea':
      return isTextarea(value);
    default:
      return true;
  }
};

export default validateInputs;
