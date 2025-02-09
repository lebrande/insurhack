import axios from "axios";

export class IApiIntegration {
    private readonly baseUrl: string = import.meta.env.VITE_IAPI_BASE_URL || '';
    private readonly realm: string = import.meta.env.VITE_IAPI_REALM || '';

    /*
    * POST 1 - IAPI generate-token
    **/
    async getToken(clientId: string, clientSecret: string, grantType: string, externalUserId: string): Promise<string> {
        const response = await axios.post(`${this.baseUrl}/api/v3/realms/${this.realm}/token`, {
            clientId: clientId,
            clientSecret: clientSecret,
            grantType: grantType,
            externalUserId: externalUserId,
        });
        const responseData = response.data as { accessToken: string };
        return responseData.accessToken;
    }

    /*
    * POST 2 - IAPI set credentials
    **/
    async getCredentialsId(token: string, credentials: any): Promise<string> {
        const response = await axios.post(`${this.baseUrl}/api/v3/credentials`, credentials, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        const responseData = response.data as { credentialsId: string };
        return responseData.credentialsId;
    }

    /*
    * POST 3 - IAPI post CEPiK
    **/
    async registerToCepik(token: string, credentialsId: string, registrationNumber: string, insurerBrandNameList: string[], pesel: string, startDate: string): Promise<string> {
        const response = await axios.post(`${this.baseUrl}/api/v3/moto/cepik`, {
            registrationNumber,
            insurerBrandNameList,
            pesel,
            startDate,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
                'Content-Type': 'application/json',
            },
        });
        const responseData = response.data as { cepikId: string };
        return responseData.cepikId;
    }

    
    /*
    * GET 3.1 - IAPI get by cepikId
    **/
    async getCepikById(token: string, credentialsId: string, cepikId: string): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/api/v3/moto/cepik/${cepikId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
            },
        });
        return response.data;
    }

    
    /*
    * POST 4 - IAPI post calculations
    **/
    async calculatePriceMoto(token: string, credentialsId: string, calculationRequest: any): Promise<any> {
        const response = await axios.post(`${this.baseUrl}/api/v3/moto/calculations`, calculationRequest, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    
    /*
    * GET 4.1 - IAPI get calculation by calculationId
    **/
    async getCalculationById(token: string, credentialsId: string, calculationId: string): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/api/v3/moto/calculations/${calculationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
            },
        });
        return response.data;
    }

    
    /*
    * PATCH 5 - IAPI update proposal
    **/
    async updateProposal(token: string, credentialsId: string, proposalId: string, updateObject: any): Promise<any> {
        const response = await axios.patch(`${this.baseUrl}/api/v3/moto/proposal/${proposalId}`, updateObject, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    /*
    * GET 5.1 - IAPI get proposal by calculationId
    **/
    async getProposalByCalculationId(token: string, credentialsId: string, calculationId: string): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/api/v3/calculations/${calculationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
            },
        });
        return response.data;
    }

    
    /*
    * POST 6 - IAPI post offer
    **/
    async postOffer(token: string, credentialsId: string, proposalId: string): Promise<string> {
        const response = await axios.post(`${this.baseUrl}/api/v3/moto/offers`, { proposalId }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
                'Content-Type': 'application/json',
            },
        });
        var responseData = response.data as { offerId: string };
        return responseData.offerId;
    }

    /*
    * GET 6.1 - IAPI get offer object by offer id
    **/
    async getOfferById(token: string, credentialsId: string, offerId: string): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/api/v3/moto/offers/${offerId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
            },
        });
        return response.data;
    }

    
    /*
    * POST 7 - IAPI post policy
    **/
    async postPolicyWithOfferId(token: string, credentialsId: string, offerId: string, paidAmount: number): Promise<string> {
        const response = await axios.post(`${this.baseUrl}/api/v3/moto/policies`, { offerId, paidAmount }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
                'Content-Type': 'application/json',
            },
        });
        var responseData = response.data as { policyId: string };
        return responseData.policyId;
    }

    /*
    * GET 7.1 - IAPI get policy object by policyId
    **/
    async getPolicyById(token: string, credentialsId: string, policyId: string): Promise<any> {
        const response = await axios.get(`${this.baseUrl}/api/v3/moto/policies/${policyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-credentials-id': credentialsId,
            },
        });
        return response.data;
    }
}

