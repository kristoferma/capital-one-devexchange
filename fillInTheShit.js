function fillInTheStuff() {
  const object = {
    chainContactPhoneNumber: '6637716',
    chainContactWeb: 'localhost:3000',
    chainName: "Peet's",
    description: 'Description',
    disclosureText: 'OFFER',
    disclosureTitle: 'Details',
    discount: '20%',
    expirationDate: '9999-03-15',
    isRedeemableInStore: 'on',
    isStoreWide: 'on',
    minimumTransaction: '5 $',
    streakCount: '365',
    timeframe: 'Year',
    title: 'Platinum',
    id: '1506199025586',
    key: '1506199025586'
  }

  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      console.log(document.getElementsByName(key))
    }
  }
}
