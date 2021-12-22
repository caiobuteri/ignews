import { stripe } from "../../services/stripe";

import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";

import Home, { getStaticProps } from "../../pages";

jest.mock('next/router');
jest.mock('next-auth/client', () => {
  return {
    useSession: () => [null, false]
  }
});
jest.mock('../../services/stripe')

describe('Home page', () => {
  it("renders correctly", () => {
    const product = {
      priceId: "123",
      amount: "R$10,00",
    }

    render(<Home product={product} />)

    expect(screen.getByText("for R$10,00")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const retrieveStripePricesMocked = mocked(stripe.prices.retrieve);
    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 1000
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$10.00'
          }
        }  
      })
    )    
  });
});