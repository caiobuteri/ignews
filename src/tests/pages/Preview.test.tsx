import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";

import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { useSession } from "next-auth/client";

import { useRouter } from "next/router";

const post = {
  slug: "my-new-post",
  title: "My new post",
  updatedAt: "10 de Abril",
  content: "<p>Post excerpt</p>",
};

jest.mock("../../services/prismic");
jest.mock("next-auth/client");
jest.mock("next/router");

describe("Post preview page", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Post post={post} />);

    expect(screen.getByText("My new post")).toBeInTheDocument();
    expect(screen.getByText("Post excerpt")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it("redirects user to full page when authenticated", async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: "fake-active-subscription" },
      false,
    ] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);

    render(<Post post={post} />);

    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
  });

  // it("loads initial data", async () => {
  //   const getSessionMocked = mocked(getSession);
  //   const getPrismicClientMocked = mocked(getPrismicClient);

  //   getPrismicClientMocked.mockReturnValueOnce({
  //     getByUID: jest.fn().mockResolvedValueOnce({
  //       data: {
  //         title: [
  //           { type: 'heading', text: 'My new post' }
  //         ],
  //         content: [
  //           { type: 'paragraph', text: 'Post content' }
  //         ]
  //       },
  //       last_publication_date: '04-01-2021'
  //     })
  //   } as any);

  //   getSessionMocked.mockReturnValueOnce({
  //     activeSubscription: 'fake-active-subscription'
  //   } as any);

  //   const response = await getServerSideProps({
  //     params: {
  //       slug: 'my-new-post'
  //     }
  //   } as any);

  //   expect(response).toEqual(
  //     expect.objectContaining({
  //       props: {
  //         post: {
  //           slug: 'my-new-post',
  //           title: 'My new post',
  //           content: '<p>Post content</p>',
  //           updatedAt: '01 de abril de 2021'
  //         }
  //       }
  //     })
  //   )
  // });
});
