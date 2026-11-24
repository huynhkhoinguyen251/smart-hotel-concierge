import { formatGuests, formatNights } from '../../utils/bookingHelpers.js';
import { formatItemCount } from '../../utils/foodCart.js';
import formatDate from '../../utils/formatDate.js';
import { formatQuantity, getCategoryLabel } from '../../utils/serviceHelpers.js';
import { formatParticipants, formatTransportQuantity, getTransportLabel } from '../../utils/tourismHelpers.js';
import RouteText from '../tourism/RouteText.jsx';
import OrderRow from './OrderRow.jsx';

// Dòng của từng loại đơn ở các trang "My ...": chỉ chọn thông tin, phần hiển thị nằm ở OrderRow.

const withTime = (value) => formatDate(value, { withTime: true });

export function BookingRow({ order }) {
  const { room } = order;
  return (
    <OrderRow
      order={order}
      to={`/my-bookings/${order.id}`}
      title={room.room_type.name}
      photo={{ src: room.primary_image, alt: `${room.room_type.name}, room ${room.room_number}` }}
      reference={`Room ${room.room_number} · Booking #${order.id}`}
      facts={[
        `${formatDate(order.check_in)} - ${formatDate(order.check_out)}`,
        `${formatNights(order.nights)} · ${formatGuests(order.guests)}`,
      ]}
    />
  );
}

export function ServiceRequestRow({ order }) {
  const { service, booking } = order;
  return (
    <OrderRow
      order={order}
      to={`/my-services/${order.id}`}
      title={service.name}
      reference={`${getCategoryLabel(service.category)} · Room ${booking.room.room_number} · Request #${order.id}`}
      facts={[withTime(order.scheduled_at), formatQuantity(order.quantity, service.category)]}
    />
  );
}

export function FoodOrderRow({ order }) {
  return (
    <OrderRow
      order={order}
      to={`/my-food-orders/${order.id}`}
      title={`Order #${order.id}`}
      reference={`Room ${order.booking.room.room_number} · ${formatItemCount(order.item_count)}`}
      facts={[`Ordered on ${withTime(order.created_at)}`]}
    />
  );
}

export function TourBookingRow({ order }) {
  const { tour } = order;
  return (
    <OrderRow
      order={order}
      to={`/my-trips/tours/${order.id}`}
      title={tour.name}
      reference={`${tour.location} · ${tour.duration} · Booking #${order.id}`}
      facts={[formatDate(order.tour_date), formatParticipants(order.participants)]}
    />
  );
}

export function TransportBookingRow({ order }) {
  const { service } = order;
  const isMotorbike = service.category === 'motorbike_rental';
  const time = withTime(order.start_at);
  return (
    <OrderRow
      order={order}
      to={`/my-trips/transport/${order.id}`}
      title={service.name}
      reference={`${getTransportLabel(service.category)} · Request #${order.id}`}
      facts={[
        isMotorbike && order.end_at ? `${time} to ${withTime(order.end_at)}` : time,
        <RouteText key="route" from={order.pickup_location} to={order.dropoff_location} />,
        [
          formatTransportQuantity(order.quantity, service.category),
          order.vehicle_plate && `Licence plate ${order.vehicle_plate}`,
        ]
          .filter(Boolean)
          .join(' · '),
      ]}
    />
  );
}
