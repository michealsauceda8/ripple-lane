import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft } from 'lucide-react';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

interface AddressFormProps {
  data: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  onChange: (data: AddressFormProps['data']) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AddressForm({ data, onChange, onNext, onBack }: AddressFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPostalCode = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 5);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!data.city.trim()) newErrors.city = 'City is required';
    if (!data.state) newErrors.state = 'State is required';
    if (data.postalCode.length !== 5) newErrors.postalCode = 'Valid ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Residential Address</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Please enter your current residential address
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address1">Street Address</Label>
        <Input
          id="address1"
          placeholder="123 Main Street"
          value={data.addressLine1}
          onChange={(e) => onChange({ ...data, addressLine1: e.target.value })}
          className={errors.addressLine1 ? 'border-destructive' : ''}
        />
        {errors.addressLine1 && (
          <p className="text-xs text-destructive">{errors.addressLine1}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address2">Apartment, Suite, etc. (optional)</Label>
        <Input
          id="address2"
          placeholder="Apt 4B"
          value={data.addressLine2}
          onChange={(e) => onChange({ ...data, addressLine2: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="New York"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select 
            value={data.state} 
            onValueChange={(value) => onChange({ ...data, state: value })}
          >
            <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-xs text-destructive">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postal">ZIP Code</Label>
        <Input
          id="postal"
          placeholder="10001"
          value={data.postalCode}
          onChange={(e) => onChange({ ...data, postalCode: formatPostalCode(e.target.value) })}
          className={`max-w-[150px] ${errors.postalCode ? 'border-destructive' : ''}`}
          maxLength={5}
        />
        {errors.postalCode && (
          <p className="text-xs text-destructive">{errors.postalCode}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
