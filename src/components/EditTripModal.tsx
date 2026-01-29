import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ExternalLink, Home, Save, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  BED_TYPES,
  createDefaultRooms,
  type RoomConfiguration,
} from '@/lib/accommodationService';
import { type AccommodationPreview, iframelyService } from '@/lib/iframely';
import { deleteTrip, type Trip, updateTrip } from '@/lib/tripService';
import { AccommodationPreview as AccommodationPreviewComponent } from './AccommodationPreview';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface EditTripModalProps {
  trip: Trip;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({
  trip,
  open,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accommodationPreview, setAccommodationPreview] =
    useState<AccommodationPreview>({
      title: '',
      description: '',
      image: '',
      site: '',
      author: '',
      url: '',
      favicon: '',
      isLoading: false,
      error: null,
    });
  const [previewLoading, setPreviewLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: trip.name || '',
    location: trip.location || '',
    description: trip.description || '',
    bookingUrl: trip.bookingUrl || '',
    flexible: trip.flexible || false,
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    estimatedMonth:
      // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
      (trip as any).estimatedmonth || (trip as any).estimatedMonth || '',
    estimatedYear:
      // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
      (trip as any).estimatedyear || (trip as any).estimatedYear || '',
    numberOfRooms: trip.numberOfRooms || 1,
    // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
    matchWith: (trip as any).matchwith || (trip as any).matchWith || 'anyone',
    isPublic:
      // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
      (trip as any).ispublic !== undefined ? (trip as any).ispublic : true,
    rooms:
      (trip.rooms as RoomConfiguration[]) ||
      createDefaultRooms(trip.numberOfRooms || 1),
  });

  const loadAccommodationPreview = async (url: string) => {
    if (!url || !url.trim()) {
      setAccommodationPreview({
        title: '',
        description: '',
        image: '',
        site: '',
        author: '',
        url: '',
        favicon: '',
        isLoading: false,
        error: null,
      });
      return;
    }

    setPreviewLoading(true);
    setAccommodationPreview((prev) => ({ ...prev, isLoading: true }));
    try {
      const preview = await iframelyService.getAccommodationPreview(url);
      setAccommodationPreview(preview);
    } catch (error) {
      console.error('Error loading preview:', error);
      setAccommodationPreview({
        title: '',
        description: '',
        image: '',
        site: '',
        author: '',
        url: '',
        favicon: '',
        isLoading: false,
        error: 'Failed to load preview',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadAccommodationPreview intentionally omitted to prevent infinite loops
  useEffect(() => {
    if (open && trip) {
      const tripRooms =
        (trip.rooms as RoomConfiguration[]) ||
        createDefaultRooms(trip.numberOfRooms || 1);
      setFormData({
        name: trip.name || '',
        location: trip.location || '',
        description: trip.description || '',
        bookingUrl: trip.bookingUrl || '',
        flexible: trip.flexible || false,
        startDate: trip.startDate || '',
        endDate: trip.endDate || '',
        estimatedMonth:
          // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
          (trip as any).estimatedmonth || (trip as any).estimatedMonth || '',
        estimatedYear:
          // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
          (trip as any).estimatedyear || (trip as any).estimatedYear || '',
        numberOfRooms: trip.numberOfRooms || 1,
        matchWith:
          // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
          (trip as any).matchwith || (trip as any).matchWith || 'anyone',
        isPublic:
          // biome-ignore lint/suspicious/noExplicitAny: DB column name mismatch
          (trip as any).ispublic !== undefined ? (trip as any).ispublic : true,
        rooms: tripRooms,
      });

      if (trip.bookingUrl) {
        loadAccommodationPreview(trip.bookingUrl);
      }
    }
  }, [open, trip]);

  useEffect(() => {
    if (formData.numberOfRooms !== formData.rooms.length) {
      setFormData((prev) => ({
        ...prev,
        rooms: createDefaultRooms(formData.numberOfRooms),
      }));
    }
  }, [formData.numberOfRooms, formData.rooms.length]);

  useEffect(() => {
    if (formData.startDate && !formData.flexible) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.startDate, formData.flexible]);

  const updateRoom = (
    roomId: number,
    field: keyof RoomConfiguration,
    // biome-ignore lint/suspicious/noExplicitAny: Room field values vary by type
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? { ...room, [field]: value } : room,
      ),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'bookingUrl') {
      const timeoutId = setTimeout(() => {
        loadAccommodationPreview(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Dynamic update object
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        bookingUrl: formData.bookingUrl,
        numberofrooms: formData.numberOfRooms,
        rooms: formData.rooms,
        matchwith: formData.matchWith,
        flexible: formData.flexible,
        ispublic: formData.isPublic,
        thumbnailUrl: accommodationPreview.image || trip.thumbnailUrl,
        ...(formData.flexible
          ? {
              estimatedmonth: formData.estimatedMonth,
              estimatedyear: formData.estimatedYear,
              startDate: null,
              endDate: null,
            }
          : {
              startDate: formData.startDate,
              endDate: formData.endDate,
              estimatedmonth: null,
              estimatedyear: null,
            }),
      };

      await updateTrip(trip.id, updateData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteTrip(trip.id);
      onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip. Please try again.');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Edit Trip</h2>
            {/* biome-ignore lint/a11y/useButtonType: Modal close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="space-y-6">
              {/* Trip Name */}
              <div>
                <Label htmlFor="name">Trip Name *</Label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Beach Getaway in Bali"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location">Location *</Label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Bali, Indonesia"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your trip, what you're looking for in a travel partner..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Booking URL */}
              <div>
                <Label htmlFor="bookingUrl">Accommodation Link</Label>
                <input
                  id="bookingUrl"
                  name="bookingUrl"
                  type="url"
                  value={formData.bookingUrl}
                  onChange={handleInputChange}
                  placeholder="https://booking.com/hotel..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.bookingUrl && (
                  <a
                    href={formData.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on booking site
                  </a>
                )}
              </div>

              {/* Accommodation Preview */}
              {formData.bookingUrl &&
                (accommodationPreview.title ||
                  accommodationPreview.image ||
                  previewLoading) && (
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Accommodation Preview
                    </h3>
                    {previewLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600">
                          Loading preview...
                        </span>
                      </div>
                    ) : accommodationPreview.title ||
                      accommodationPreview.image ? (
                      <AccommodationPreviewComponent
                        preview={accommodationPreview}
                      />
                    ) : null}
                  </div>
                )}

              {/* Date Flexibility */}
              <div>
                <Label>Travel Dates</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="flexible"
                      checked={formData.flexible}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Flexible dates</span>
                  </label>
                </div>
              </div>

              {/* Date Selection */}
              {formData.flexible ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedMonth">Estimated Month</Label>
                    <select
                      id="estimatedMonth"
                      name="estimatedMonth"
                      value={formData.estimatedMonth}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          estimatedMonth: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select month</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedYear">Estimated Year</Label>
                    <select
                      id="estimatedYear"
                      name="estimatedYear"
                      value={formData.estimatedYear}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          estimatedYear: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required={!formData.flexible}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={
                        formData.startDate ||
                        new Date().toISOString().split('T')[0]
                      }
                      required={!formData.flexible}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Number of Rooms */}
              <div>
                <Label htmlFor="numberOfRooms">Number of Rooms</Label>
                <input
                  id="numberOfRooms"
                  name="numberOfRooms"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfRooms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Room Configuration */}
              <div>
                <Label>Room Configuration</Label>
                <div className="space-y-4 mt-3">
                  {formData.rooms.map((room, index) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Room {index + 1}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Number of Beds */}
                        <div>
                          <Label htmlFor={`beds-${room.id}`}>
                            Number of Beds *
                          </Label>
                          <input
                            id={`beds-${room.id}`}
                            type="number"
                            min="1"
                            max="10"
                            value={room.numberOfBeds}
                            onChange={(e) =>
                              updateRoom(
                                room.id,
                                'numberOfBeds',
                                parseInt(e.target.value, 10) || 1,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Bed Type */}
                        <div>
                          <Label htmlFor={`bedType-${room.id}`}>
                            Bed Type *
                          </Label>
                          <select
                            id={`bedType-${room.id}`}
                            value={room.bedType}
                            onChange={(e) =>
                              updateRoom(room.id, 'bedType', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            {BED_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Ensuite Bathroom */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`ensuite-${room.id}`}
                          checked={room.ensuiteBathroom}
                          onChange={(e) =>
                            updateRoom(
                              room.id,
                              'ensuiteBathroom',
                              e.target.checked,
                            )
                          }
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label
                          htmlFor={`ensuite-${room.id}`}
                          className="text-base font-medium text-gray-700"
                        >
                          Ensuite Bathroom
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Match Preferences */}
              <div>
                <Label>Who would you like to match with?</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="matchWith"
                      value="anyone"
                      checked={formData.matchWith === 'anyone'}
                      onChange={handleInputChange}
                    />
                    <span>Anyone</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="matchWith"
                      value="male"
                      checked={formData.matchWith === 'male'}
                      onChange={handleInputChange}
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="matchWith"
                      value="female"
                      checked={formData.matchWith === 'female'}
                      onChange={handleInputChange}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <Label>Trip Visibility</Label>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm">Make this trip public</span>
                  </label>
                </div>
              </div>

              {/* Delete Trip Section */}
              <div className="border-t pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    Deleting this trip will permanently remove it and all
                    associated data.
                  </p>
                  {!showDeleteConfirm ? (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Trip
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">
                          Are you sure? This cannot be undone.
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          {deleteLoading ? 'Deleting...' : 'Yes, Delete Trip'}
                        </Button>
                        {/* biome-ignore lint/a11y/useButtonType: Cancel button */}
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            {/* biome-ignore lint/a11y/useButtonType: Cancel button */}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={
                loading ||
                !formData.name ||
                !formData.location ||
                !formData.description
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
