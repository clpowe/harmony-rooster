export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const authorized = await $fetch(
    "https://api.intuit.com/quickbooks/v4/payments/charges",
    {
      method: "post",
      body: {
        amount: "100.00",
        currency: "USD",
        capture: false,
        context: { mobile: false, isEcommerce: true },
        card: {
          name: "emulate=0",
          number: "4111111111111111",
          expMonth: "02",
          address: {
            postalCode: "94086",
            country: "US",
            region: "CA",
            streetAddress: "1130 Kifer Rd",
            city: "Sunnyvale",
          },
          expYear: "2025",
          cvc: "123",
        },
      },
    },
  );

  console.log(authorized);
});
