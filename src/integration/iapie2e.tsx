import {IApiIntegration} from "@/integration/iapi"

export class IApiE2E {
    private readonly iApiIntegration: IApiIntegration = new IApiIntegration;

    private readonly clientId = import.meta.env.VITE_IAPI_CLIENT_ID || '';
    private readonly clientSecret = import.meta.env.VITE_IAPI_CLIENT_SECRET || '';

    private readonly credentials = {
        "tuz": {
            "apiUrl": "https://iapi.pl",
            "ofwcaId": "zzzz",
            "login": "zzzzzz",
            "password": "zzzzzz"
        },
        "uniqa": {
            "url": "https://iapi.pl",
            "login": "ccccc",
            "token": "cccc",
            "userId": "ddddddd",
            "password": "cccccc",
            "externalSystemId": "aaaaa",
            "externalSystemName": "aaaa",
            "useMocks": true
        }
    };

    private readonly cepik = {
        "registrationNumber": "LZA44906",
        "insurerBrandNameList": [
            "tuz",
            "uniqa"
        ],
        "pesel": "57062684749",
        "startDate": "2025-02-09T00:00:00.000Z"
    }

    private readonly info = {
        "phone": "513773640",
        "dateOfBirth": "1957-06-26",
        "email": "test@example.com",
        "postalCode": "18-400",
        "endDate": "2026-02-20"
    }

    private readonly proposalRequest = {
        "subjectList": [
            {
                "type": "person",
                "roleList": [
                    "INSURER",
                    "INSURED",
                    "OWNER"
                ],
                "dateOfBirth": "1957-06-26",
                "pesel": "57062684749",
                "hasRequiredLicence": true,
                "email": "test@example.com",
                "phone": "513773640",
                "postalCode": "18-400",
                "name": "Monika",
                "surname": "Supertest",
                "town": "Łomża",
                "street": "Górna",
                "buildingNumber": "97",
                "drivingLicenseDate": "1990-10-12T00:00:00.000Z",
                "drivingLicenseYear": 1990,
                "addressOnVehicleRegistration": {
                    "vehicleRegistrationAddressDifferent": false,
                    "postalCode": "18-400",
                    "town": "Łomża",
                    "street": "Górna",
                    "buildingNumber": "97"
                }
            }
        ],
        "consentList": [
            {
                "id": "91076c0f-687b-4062-8280-6a0e063d8aad",
                "accepted": true
            },
            {
                "id": "178b84f3-30f8-4804-a46e-3f51167a0dfd",
                "accepted": true
            },
            {
                "id": "deb484c5-4919-4994-ae3b-9b5a12914769",
                "accepted": true
            },
            {
                "id": "73bdf24d-f844-4082-b920-0dbfe43af8dc",
                "accepted": true
            }
        ],
        "vehicleList": [
            {
                "isHistorical": false,
                "firstRegistrationInPolandDate": "2009-11-12T00:00:00.000Z",
                "technicalServiceExpirationDate": "2025-11-14T00:00:00.000Z",
                "originalKeysOrControllersNumber": 2,
                "additionalKeysOrControllersNumber": 2,
                "vehicleVisibleDamageStatus": false,
                "vehicleSecurity": false,
                "securityAlarm": false,
                "securityGearLock": false,
                "securityGps": false,
                "securityImmobiliser": false,
                "vin": "TMBHS61Z8Z7225767",
                "registrationNumber": "LZA44906"
            }
        ]
    }

    async createPolicy(): Promise<string> {
        const token = await this.iApiIntegration.getToken(
            this.clientId,
            this.clientSecret,
            'client_credentials',
            'postman.user'
        )

        const credentialsId = await this.iApiIntegration.getCredentialsId(token, this.credentials)

        const cepikId = await this.iApiIntegration.registerToCepik(
            token,
            credentialsId,
            this.cepik.registrationNumber,
            this.cepik.insurerBrandNameList,
            this.cepik.pesel,
            this.cepik.startDate
        );

        var calculationRequest = {
            "subjectList": [
                {
                    "type": "person",
                    "roleList": [
                        "INSURER",
                        "INSURED",
                        "OWNER"
                    ],
                    "dateOfBirth": this.info.dateOfBirth,
                    "pesel": this.cepik.pesel,
                    "hasRequiredLicence": true,
                    "email": this.info.email,
                    "phone": this.info.phone,
                    "postalCode": this.info.postalCode
                }
            ],
            "insurerDifferentThanPrimaryInsured": false,
            "isLeasing": false,
            "isAssignment": false,
            "vehicleDetailList": [
                {
                    "mileage": 132500,
                    "usageType": "private",
                    "registrationNumber": "LZA44906",
                    "infoekspertId": "03400958",
                    "productionYear": 2009,
                    "steeringWheelSide": "left",
                    "purchaseDate": "2021-11-18T00:00:00.000Z",
                    "vehicleType": "O",
                    "vin": "TMBHS61Z8Z7225767",
                    "firstRegistrationDate": "2009-08-06T00:00:00.000Z"
                }
            ],
            "expectations": {
                "insuranceStartDate": this.cepik.startDate,
                "insuranceEndDate": this.info.endDate,
                "insurerBrandNameList": this.cepik.insurerBrandNameList,
                "variantList": [
                    "maxi",
                    "opti",
                    "mini"
                ],
                "maxOffers": 1,
                "paymentMethod": "transfer"
            }
        }

        const calculationPostResponse = await this.iApiIntegration.calculatePriceMoto(token, credentialsId, {
            cepikId,
            credentialsId,
            ...calculationRequest
        })

        await new Promise(r => setTimeout(r, 1500));

        const calculationResponse = await this.iApiIntegration.getCalculationById(token, credentialsId, calculationPostResponse.calculationId)

        const firstDoneProposal = calculationResponse.proposalList.find((proposal: any) => proposal.status === 'done');
        const proposalId = firstDoneProposal ? firstDoneProposal.proposalId : null;

        await this.iApiIntegration.updateProposal(token, credentialsId, proposalId, this.proposalRequest)

        await new Promise(r => setTimeout(r, 1500));
        
        const offerId = await this.iApiIntegration.postOffer(token, credentialsId, proposalId);

        await new Promise(r => setTimeout(r, 3000));

        const policyId = await this.iApiIntegration.postPolicyWithOfferId(token, credentialsId, offerId, 0);

        return await this.iApiIntegration.getPolicyById(token, credentialsId, policyId);
    }
}
