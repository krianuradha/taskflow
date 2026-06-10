import Mailgen from 'mailgen'

export const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'Project Camp',
    link: process.env.FRONTEND_URL || 'http://localhost:3000',
    // logo: `${process.env.FRONTEND_URL}/logo.png`, // uncomment once you have a logo
  },
})
