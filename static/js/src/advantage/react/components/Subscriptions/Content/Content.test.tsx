import React from "react";
import { mount } from "enzyme";

import Content from "./Content";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserSubscription } from "advantage/api/types";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import SubscriptionList from "../SubscriptionList";

describe("Content", () => {
  let queryClient: QueryClient;
  let contract: UserSubscription;

  beforeEach(async () => {
    queryClient = new QueryClient();
    contract = userSubscriptionFactory.build();
    queryClient.setQueryData("userSubscriptions", [contract]);
  });

  it("displays a spinner when loading", () => {
    // Remove the queries so that the query starts loading.
    queryClient.removeQueries("userSubscriptions");
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='initial-load'] Spinner").exists()).toBe(
      true
    );
    expect(wrapper.find("SubscriptionList").exists()).toBe(false);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(false);
  });

  it("displays the list and details when loaded", () => {
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find("[data-test='initial-load']").exists()).toBe(false);
    expect(wrapper.find("SubscriptionList").exists()).toBe(true);
    expect(wrapper.find("SubscriptionDetails").exists()).toBe(true);
  });

  it("selects the first UA subscription", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("2020-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2021-09-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("2021-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.CanonicalUA,
        start_date: new Date("1999-08-11T02:56:54Z"),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find(SubscriptionList).prop("selectedId")).toBe(
      subscriptions[2].id
    );
  });

  it("selects the first non-UA sub if there are no UA subs", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2020-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2021-09-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        marketplace: UserSubscriptionMarketplace.Free,
        start_date: new Date("2021-08-11T02:56:54Z"),
      }),
    ];
    queryClient.setQueryData("userSubscriptions", subscriptions);
    const wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Content />
      </QueryClientProvider>
    );
    expect(wrapper.find(SubscriptionList).prop("selectedId")).toBe(
      subscriptions[1].id
    );
  });
});
