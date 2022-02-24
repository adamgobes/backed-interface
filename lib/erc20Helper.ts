import { getUnitPriceForCoin } from './coingecko';

export type ERC20Amount = {
  nominal: string;
  symbol: string;
  address: string;
};

export async function convertERC20ToCurrency(
  amounts: ERC20Amount[],
  currency: string,
) {
  let total = 0;
  for (let i = 0; i < amounts.length; i++) {
    const convertedAmount = await getUnitPriceForCoin(
      amounts[i].address,
      currency,
    );
    if (!convertedAmount) return 0;
    total += parseFloat(amounts[i].nominal) * convertedAmount;
  }
  return total;
}
