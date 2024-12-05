const verificationCodes: { [phoneNumber: string]: string } = {};

export const sendVerificationCodeSMS = async (
  phoneNumber: string,
  verificationCode: string
) => {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `App ${process.env.INFOBIP_API_KEY}`);
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Accept', 'application/json');

  const raw = JSON.stringify({
    messages: [
      {
        destinations: [{ to: phoneNumber }],
        from: '447491163443',
        text: `Your verification code is ${verificationCode}`,
      },
    ],
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow' as RequestRedirect,
  };

  fetch('https://4ej55n.api.infobip.com/sms/2/text/advanced', requestOptions)
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      verificationCodes[phoneNumber] = verificationCode;
    })
    .catch((error) => console.error(error));
};

export const verifyCodeSMS = async (phoneNumber: string, code: string) => {
  if (!verificationCodes[phoneNumber]) {
    return false;
  }
  return verificationCodes[phoneNumber] === code;
};
