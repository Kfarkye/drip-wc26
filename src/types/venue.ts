export interface WithdrawalMethod {
  method: string;
  speed: string;
  fee: string;
  min: string;
  max: string;
}

export interface DepositMethod {
  method: string;
  speed: string;
  fee: string;
  min: string;
  max: string;
}

export interface Venue {
  id: string;
  name: string;
  type: 'us_regulated' | 'international' | 'prediction_market';
  url: string;
  affiliateUrl?: string;
  withdrawals: WithdrawalMethod[];
  deposits: DepositMethod[];
  regulatoryNote?: string;
  logoPath?: string;
}
