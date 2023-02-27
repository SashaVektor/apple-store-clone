import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import Button from "../components/Button"
import CheckoutProduct from "../components/CheckoutProduct"
import Header from "../components/Header"
import { selectBasketItems, selectBasketTotal } from "../redux/basketSlice"
import Currency from "react-currency-formatter"
import { ChevronDownIcon } from "@heroicons/react/24/solid"
import { Stripe } from "stripe"
import { fetchPostJSON } from "../utils/apiHelpers"
import getStripe from "../utils/getStripeJs"

const Checkout = () => {
    const items = useSelector(selectBasketItems)
    const router = useRouter()
    const [groupedItemsInBasket, setGroupedItemsInBasket] = useState({} as { [key: string]: Product[] })
    const [loading, setLoading] = useState<boolean>(false)
    const basketTotal = useSelector(selectBasketTotal)

    useEffect(() => {
        // Group different items to the same place
        const groupedItems = items.reduce((acc, item) => {
            (acc[item._id] = acc[item._id] || []).push(item)
            return acc
        }, {} as { [key: string]: Product[] })

        setGroupedItemsInBasket(groupedItems)
    }, [items])

    const createCheckoutSession = async () => {
        setLoading(true)

        const checkoutSession: Stripe.Checkout.Session = await fetchPostJSON("/api/checkout_session", {
            items
        })

        if ((checkoutSession as any).statusCode === 500) {
            console.log((checkoutSession as any).message)
            return
        }

        const stripe = await getStripe()
        const { error } = await stripe!.redirectToCheckout({
            sessionId: checkoutSession.id
        })

        console.log(error.message);
        setLoading(false)
    }

    return (
        <div className="min-h-screen overflow-hidden bg-[#e7ecee]">
            <Head>
                <title>Bag - Apple</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <main className="mx-auto max-w-5xl pb-24">
                <div className="px-5">
                    <h1 className="my-4 text-3xl font-semibold lg:text-4xl">
                        {items.length > 0 ? "Review your bag." : "Your bag is empty"}
                    </h1>
                    <p className="my-4">Free delivery and returns</p>
                    {items.length === 0 && (
                        <Button title="Continue shopping" onClick={() => router.push("/")} />
                    )}
                </div>
                {items.length > 0 && (
                    <div className="mx-5 md:mx-8">
                        {Object.entries(groupedItemsInBasket).map(([key, items]) => (
                            <CheckoutProduct key={key} items={items} id={key} />
                        ))}
                        <div className="my-12 mt-6 ml-auto max-w-3xl">
                            <div className="divide-y divide-gray-300">
                                <div className="pb-4">
                                    <div className="flex justify-between">
                                        <p>
                                            Subtotal:
                                        </p>
                                        <p>
                                            <Currency currency="USD" quantity={basketTotal} />
                                        </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p>Shipping</p>
                                        <p>FREE</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-x-1 lg:flex-row">
                                            Estimated tax for: {" "}
                                            <p className="flex cursor-pointer items-end text-blue-500 hover:underline">
                                                Enter zip code
                                                <ChevronDownIcon className="h-6 w-6" />
                                            </p>
                                        </div>
                                        <p>$ -</p>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4 text-xl font-semibold">
                                    <h4>Total</h4>
                                    <h4>
                                        <Currency quantity={basketTotal} currency="USD" />
                                    </h4>
                                </div>
                            </div>
                            <div className="my-14 space-y-4">
                                <h4 className="text-xl font-semibold">
                                    How would you to check out?
                                </h4>
                                <div className="flex flex-col gap-4 md:flex-row">
                                    <div className="order-2 flex flex-1 flex-col items-center rounded-xl bg-gray-200 p-8 py-12 text-center">
                                        <h4 className="mb-4 flex flex-col text-xl font-semibold">
                                            <span>Pay Monthly</span>
                                            <span>with Apple Card</span>
                                            <span>
                                                $283.16/mo. at 0% APR <sup className="-top-1">{"<>"}</sup>
                                            </span>
                                        </h4>
                                        <Button title="Check Out with Apple Card Monthly Installments" />
                                        <p className="mt-2 max-w-[240px] text-[13px]">
                                            $0.00 due today, which includes applicable full-price
                                            items, down payments, shipping, and taxes
                                        </p>
                                    </div>
                                    <div className="flex flex-1 flex-col items-center rounded-xl bg-gray-200 p-8 py-12 text-center md:order-2">
                                        <h4 className="mb-4 flex flex-col text-xl font-semibold">
                                            Pay in full
                                            <span>
                                                <Currency quantity={basketTotal} currency="USD" />
                                            </span>
                                        </h4>
                                        <Button title="Check Out"
                                            loading={loading}
                                            width="w-full"
                                            noIcon
                                            onClick={createCheckoutSession}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Checkout
