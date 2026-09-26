const ORDER_STATUS_MAP = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Processing',
  3: 'Shipped',
  4: 'Delivered',
  5: 'Cancelled',
};

const PAYMENT_STATUS_MAP = {
  0: 'Pending',
  1: 'Paid',
  2: 'Failed',
  3: 'Refunded',
};

const PAYMENT_METHOD_MAP = {
  0: 'COD',
  1: 'eSewa',
};

function normalizeValue(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    const directMatch = Object.entries(ORDER_STATUS_MAP).find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
    if (directMatch) {
      return Number(directMatch[0]);
    }

    const paymentMatch = Object.entries(PAYMENT_STATUS_MAP).find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
    if (paymentMatch) {
      return Number(paymentMatch[0]);
    }

    const methodMatch = Object.entries(PAYMENT_METHOD_MAP).find(([, label]) => label.toLowerCase() === trimmed.toLowerCase());
    if (methodMatch) {
      return Number(methodMatch[0]);
    }

    return trimmed;
  }

  return value;
}

export function getOrderStatusLabel(value) {
  const normalized = normalizeValue(value);
  if (typeof normalized === 'number') {
    return ORDER_STATUS_MAP[normalized] || 'Unknown';
  }

  return normalized || 'Unknown';
}

export function getPaymentStatusLabel(value) {
  const normalized = normalizeValue(value);
  if (typeof normalized === 'number') {
    return PAYMENT_STATUS_MAP[normalized] || 'Unknown';
  }

  return normalized || 'Unknown';
}

export function getPaymentMethodLabel(value) {
  const normalized = normalizeValue(value);
  if (typeof normalized === 'number') {
    return PAYMENT_METHOD_MAP[normalized] || 'Unknown';
  }

  return normalized || 'Unknown';
}

function getBadgeClasses(type, value) {
  const orderStatusClasses = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700',
    Confirmed: 'border-blue-200 bg-blue-50 text-blue-700',
    Processing: 'border-violet-200 bg-violet-50 text-violet-700',
    Shipped: 'border-sky-200 bg-sky-50 text-sky-700',
    Delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  const paymentStatusClasses = {
    Pending: 'border-amber-200 bg-amber-50 text-amber-700',
    Paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Failed: 'border-rose-200 bg-rose-50 text-rose-700',
    Refunded: 'border-slate-200 bg-slate-100 text-slate-700',
  };

  const methodClasses = {
    COD: 'border-slate-200 bg-slate-100 text-slate-700',
    'eSewa': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  };

  const map = type === 'order' ? orderStatusClasses : type === 'payment' ? paymentStatusClasses : methodClasses;
  return map[value] || 'border-slate-200 bg-slate-100 text-slate-700';
}

export function OrderStatusBadge({ status }) {
  const label = getOrderStatusLabel(status);

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClasses('order', label)}`}>
      {label}
    </span>
  );
}

export function PaymentStatusBadge({ status }) {
  const label = getPaymentStatusLabel(status);

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClasses('payment', label)}`}>
      {label}
    </span>
  );
}

export function PaymentMethodBadge({ method }) {
  const label = getPaymentMethodLabel(method);

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBadgeClasses('method', label)}`}>
      {label}
    </span>
  );
}
