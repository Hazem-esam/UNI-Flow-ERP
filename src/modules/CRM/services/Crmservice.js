const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Helper function to handle API errors
const handleApiError = async (response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API Error: ${response.status}`);
  }
  return response;
};

// ==================== LEADS API ====================

export const leadsApi = {
  // GET all leads
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lead`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  // GET single lead by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lead/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching lead:", error);
      throw error;
    }
  },

  // POST create new lead
  create: async (leadData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lead`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(leadData),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
  },

  // PUT update lead
  update: async (id, leadData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lead/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(leadData),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  },

  // DELETE lead
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lead/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error deleting lead:", error);
      throw error;
    }
  },

  // POST convert lead to customer
  convert: async (id, conversionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Lead/${id}/convert`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(conversionData),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error converting lead:", error);
      throw error;
    }
  },
};

// ==================== CUSTOMERS API ====================

export const customersApi = {
  // GET all customers
  getAll: async (isActive = null) => {
    try {
      const url = isActive !== null 
        ? `${API_BASE_URL}/api/sales/Customers?isActive=${isActive}`
        : `${API_BASE_URL}/api/sales/Customers`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // GET single customer by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/Customers/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  // POST create new customer
  create: async (customerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/Customers`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(customerData),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // PUT update customer
  update: async (id, customerData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/Customers/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(customerData),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // DELETE customer
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/Customers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};

// ==================== PIPELINE API ====================

export const pipelineApi = {
  // GET all pipeline deals
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pipeline`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching pipeline:", error);
      throw error;
    }
  },

  // GET single pipeline deal by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pipeline/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching pipeline deal:", error);
      throw error;
    }
  },

  // POST create new pipeline deal
  create: async (dealData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pipeline`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(dealData),
      });
      await handleApiError(response);
      return await response.json();
    } catch (error) {
      console.error("Error creating pipeline deal:", error);
      throw error;
    }
  },

  // PUT update pipeline deal
  update: async (id, dealData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pipeline/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(dealData),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error updating pipeline deal:", error);
      throw error;
    }
  },

  // DELETE pipeline deal
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pipeline/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error deleting pipeline deal:", error);
      throw error;
    }
  },

  // PATCH move deal to different stage
  moveStage: async (id, stage) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Pipeline/${id}/move-stage`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ stage }),
      });
      await handleApiError(response);
      return true;
    } catch (error) {
      console.error("Error moving pipeline deal stage:", error);
      throw error;
    }
  },
};

// ==================== ENUMS ====================
// Based on the API documentation

export const LeadSource = {
  WEBSITE: 1,
  REFERRAL: 2,
  COLD_CALL: 3,
  LINKEDIN: 4,
  EMAIL_CAMPAIGN: 5,
  EVENT: 6,
};

export const LeadStage = {
  NEW: 1,
  QUALIFIED: 2,
  PROPOSAL: 3,
  NEGOTIATION: 4,
};

export const DealStage = {
  PROSPECTING: 1,
  QUALIFICATION: 2,
  PROPOSAL: 3,
  NEGOTIATION: 4,
  CLOSED_WON: 5,
  CLOSED_LOST: 6,
};

// Helper functions to convert between frontend and backend formats
export const mapSourceToEnum = (source) => {
  const mapping = {
    Website: LeadSource.WEBSITE,
    Referral: LeadSource.REFERRAL,
    "Cold Call": LeadSource.COLD_CALL,
    LinkedIn: LeadSource.LINKEDIN,
    "Email Campaign": LeadSource.EMAIL_CAMPAIGN,
    Event: LeadSource.EVENT,
  };
  return mapping[source] || LeadSource.WEBSITE;
};

export const mapEnumToSource = (enumValue) => {
  const mapping = {
    [LeadSource.WEBSITE]: "Website",
    [LeadSource.REFERRAL]: "Referral",
    [LeadSource.COLD_CALL]: "Cold Call",
    [LeadSource.LINKEDIN]: "LinkedIn",
    [LeadSource.EMAIL_CAMPAIGN]: "Email Campaign",
    [LeadSource.EVENT]: "Event",
  };
  return mapping[enumValue] || "Website";
};

export const mapStageToEnum = (stage) => {
  const mapping = {
    new: LeadStage.NEW,
    qualified: LeadStage.QUALIFIED,
    proposal: LeadStage.PROPOSAL,
    negotiation: LeadStage.NEGOTIATION,
  };
  return mapping[stage] || LeadStage.NEW;
};

export const mapEnumToStage = (enumValue) => {
  const mapping = {
    [LeadStage.NEW]: "new",
    [LeadStage.QUALIFIED]: "qualified",
    [LeadStage.PROPOSAL]: "proposal",
    [LeadStage.NEGOTIATION]: "negotiation",
  };
  return mapping[enumValue] || "new";
};

export const mapDealStageToEnum = (stage) => {
  const mapping = {
    prospecting: DealStage.PROSPECTING,
    qualification: DealStage.QUALIFICATION,
    proposal: DealStage.PROPOSAL,
    negotiation: DealStage.NEGOTIATION,
    "closed won": DealStage.CLOSED_WON,
    "closed lost": DealStage.CLOSED_LOST,
  };
  return mapping[stage?.toLowerCase()] || DealStage.PROSPECTING;
};

export const mapEnumToDealStage = (enumValue) => {
  const mapping = {
    [DealStage.PROSPECTING]: "Prospecting",
    [DealStage.QUALIFICATION]: "Qualification",
    [DealStage.PROPOSAL]: "Proposal",
    [DealStage.NEGOTIATION]: "Negotiation",
    [DealStage.CLOSED_WON]: "Closed Won",
    [DealStage.CLOSED_LOST]: "Closed Lost",
  };
  return mapping[enumValue] || "Prospecting";
};