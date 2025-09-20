'use client';
import { Button } from '@/components/ui/button';

export default function PayPage() {
  const initiatePayment = async () => {
    const res = await fetch('/api/razorpay-order', {
      method: 'POST',
      body: JSON.stringify({ amount: 500 }), // ₹500
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: data.currency,
      name: 'Your Brand',
      description: 'Test Transaction',
      order_id: data.id,
      handler: (response: any) => {
        alert(`Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: 'Adul S',
        email: 'aduls.career@gmail.com',
        contact: '9123456780',
      },
      theme: {
        color: '#0f172a',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Button onClick={initiatePayment}>Pay ₹500</Button>
    </div>
  );
}
