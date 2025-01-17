import { Loan } from 'types/Loan';
import { Loan as SubgraphLoan } from 'types/generated/graphql/nftLoans';
import { parseSubgraphLoan } from './utils';

export async function getAllLoansForAddress(address: string): Promise<Loan[]> {
  const res = await fetch(`/api/addresses/${address}/loans`);
  const loans = await res.json();
  return loans.map((loan: SubgraphLoan) => parseSubgraphLoan(loan));
}
