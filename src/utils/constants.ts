export const APP_NAME = 'NEXTVIBE'
export const APP_DESCRIPTION = 'NextVibe'
export const SIZE = '324 by 576'
export const JWT_SECRET = process.env.JWT_SECRET || 'secret'
export const GOOGLE_ANALYTICS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX'

export const NAIRA_SIGN = '₦'
export const DOLLAR_SIGN = '$'
export const PRIMARY_COLOR = '#5B1A57'

// const isLocalhost =
//   typeof window !== 'undefined' && window.location.hostname === 'localhost'

export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_LIVE_KEY!
// isLocalhost
//   ? process.env.NEXT_PUBLIC_PAYSTACK_TEST_KEY!
//   : process.env.NEXT_PUBLIC_PAYSTACK_LIVE_KEY!

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'https://api.nextvibe.co'
export const colors = {
  primary: PRIMARY_COLOR,
  secondary: '#F5F5F5',
  tertiary: '#F08AF4',
  alternative: '#A1349A40',
  // tertiary: "#E0E0E0",
  // quaternary: "#BDBDBD",
  // quinary: "#9E9E9E",
  // senary: "#757575",
  // septenary: "#616161",
  // octonary: "#424242",
  // nonary: "#212121",
}

