export interface IAbandonedCartData {
    reference_id: string,
    reason_type: null,
    number: string,
    admin_url: string,
    customer_name: string,
    customer_email: string,
    customer_phone: string,
    billing_address: IAddress,
    shipping_address: IAddress,
    line_items: ILineItems[],
    currency: string,
    total_price: number,
    subtotal_price: number,
    referring_site: string,
    checkout_url: string,
    completed_at: string,
    original_created_at: string
}

export interface IPurchase {
    reference_id: string,
    number: string,
    admin_url: string,
    customer_name: string,
    customer_email: string,
    customer_phone: string,
    billing_address: IAddress,
    shipping_address: IAddress,
    line_items: ILineItems[],
    currency: string,
    total_price: number,
    subtotal_price: number,
    payment_status: string,
    payment_method: string,
    tracking_numbers: string,
    referring_site: string,
    status_url: string,
    billet_url: string,
    billet_line: string,
    billet_expired_at: string,
    original_created_at: string
}

interface ILineItems {
    title: string,
    variant_title: string,
    quantity: number,
    price: number,
    path: string,
    image_url: string, 
    tracking_number: null
}

interface IAddress {
    name: string,
    first_name: string,
    last_name: string,
    company: null,
    phone: string,
    address1: string,
    address2: string,
    city: string,
    province: string,
    province_code: string,
    country: string,
    country_code: string,
    zip: string,
    latitude: null,
    longitude: null
}