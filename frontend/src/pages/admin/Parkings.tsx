import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardTitle } from '../../components/ui/Card';
import { parkingService } from '../../services/parkingService';

interface ParkingForm {
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  totalSlots: number;
  pricePerHour: number;
  openingHours: { open: string; close: string };
  description?: string;
}

export default function Parkings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParking, setEditingParking] = useState<any>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParkingForm>();

  const { data: parkingsData, isLoading } = useQuery({
    queryKey: ['parkings'],
    queryFn: parkingService.getAllParkings,
  });

  const createMutation = useMutation({
    mutationFn: parkingService.createParking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkings'] });
      toast.success('Parking created successfully');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Failed to create parking');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      parkingService.updateParking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkings'] });
      toast.success('Parking updated successfully');
      setIsModalOpen(false);
      setEditingParking(null);
      reset();
    },
    onError: () => {
      toast.error('Failed to update parking');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: parkingService.deleteParking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parkings'] });
      toast.success('Parking deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete parking');
    },
  });

  const onSubmit = (data: ParkingForm) => {
    const parkingData = {
      name: data.name,
      address: data.address,
      city: data.city,
      country: data.country,
      coordinates: { lat: Number(data.lat), lng: Number(data.lng) },
      totalSlots: Number(data.totalSlots),
      pricePerHour: Number(data.pricePerHour),
      openingHours: data.openingHours,
      description: data.description,
    };

    if (editingParking) {
      updateMutation.mutate({ id: editingParking._id, data: parkingData });
    } else {
      createMutation.mutate(parkingData);
    }
  };

  const handleEdit = (parking: any) => {
    setEditingParking(parking);
    reset({
      name: parking.name,
      address: parking.address,
      city: parking.city,
      country: parking.country,
      lat: parking.coordinates.lat,
      lng: parking.coordinates.lng,
      totalSlots: parking.totalSlots,
      pricePerHour: parking.pricePerHour,
      openingHours: parking.openingHours,
      description: parking.description,
    });
    setIsModalOpen(true);
  };

  const parkings = parkingsData?.parkings || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parkings Management</h1>
          <p className="text-gray-600 mt-1">Manage all parking locations</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingParking(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          Add Parking
        </Button>
      </div>

      {/* Parkings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : parkings.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No parkings found
          </div>
        ) : (
          parkings.map((parking: any) => (
            <Card key={parking._id} hover>
              <div className="relative">
                <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg flex items-center justify-center">
                  <MapPin className="text-white" size={48} />
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(parking)}
                    className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
                  >
                    <Edit size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this parking?')) {
                        deleteMutation.mutate(parking._id);
                      }
                    }}
                    className="p-2 bg-white rounded-lg shadow hover:bg-red-50"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <CardTitle className="mb-2">{parking.name}</CardTitle>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-start">
                    <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    {parking.address}, {parking.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Slots</p>
                    <p className="text-lg font-semibold">{parking.totalSlots}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Available</p>
                    <p className="text-lg font-semibold text-green-600">
                      {parking.availableSlots}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Price/Hour</p>
                    <p className="text-lg font-semibold">${parking.pricePerHour}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        parking.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {parking.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {parking.openingHours.open} - {parking.openingHours.close}
                    </span>
                    <span className="text-gray-600">
                      {Math.round(
                        (parking.availableSlots / parking.totalSlots) * 100
                      )}
                      % available
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingParking ? 'Edit Parking' : 'Add New Parking'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingParking(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Parking Name"
                  placeholder="Downtown Parking A"
                  error={errors.name?.message}
                  {...register('name', { required: 'Name is required' })}
                />

                <Input
                  label="City"
                  placeholder="Chisinau"
                  error={errors.city?.message}
                  {...register('city', { required: 'City is required' })}
                />
              </div>

              <Input
                label="Address"
                placeholder="123 Main Street"
                error={errors.address?.message}
                {...register('address', { required: 'Address is required' })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Country"
                  placeholder="Moldova"
                  error={errors.country?.message}
                  {...register('country', { required: 'Country is required' })}
                />

                <Input
                  label="Total Slots"
                  type="number"
                  placeholder="50"
                  error={errors.totalSlots?.message}
                  {...register('totalSlots', {
                    required: 'Total slots is required',
                    min: { value: 1, message: 'Must be at least 1' },
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Latitude"
                  type="number"
                  step="0.000001"
                  placeholder="47.0105"
                  error={errors.lat?.message}
                  {...register('lat', { required: 'Latitude is required' })}
                />

                <Input
                  label="Longitude"
                  type="number"
                  step="0.000001"
                  placeholder="28.8638"
                  error={errors.lng?.message}
                  {...register('lng', { required: 'Longitude is required' })}
                />
              </div>

              <Input
                label="Price per Hour ($)"
                type="number"
                step="0.01"
                placeholder="5.00"
                error={errors.pricePerHour?.message}
                {...register('pricePerHour', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Must be positive' },
                })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Opening Time"
                  type="time"
                  error={errors.openingHours?.open?.message}
                  {...register('openingHours.open', { required: 'Opening time is required' })}
                />

                <Input
                  label="Closing Time"
                  type="time"
                  error={errors.openingHours?.close?.message}
                  {...register('openingHours.close', { required: 'Closing time is required' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Additional information about the parking..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('description')}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingParking(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingParking ? 'Update' : 'Create'} Parking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
