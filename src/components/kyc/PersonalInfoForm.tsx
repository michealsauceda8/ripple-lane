import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { User, Calendar, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn: string;
  phoneNumber: string;
}

interface PersonalInfoFormProps {
  onSubmit: (data: PersonalInfoData) => void;
  initialData?: PersonalInfoData;
}

export function PersonalInfoForm({ onSubmit, initialData }: PersonalInfoFormProps) {
  const [data, setData] = useState<PersonalInfoData>(initialData || {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    phoneNumber: '',
  });
  const [showSSN, setShowSSN] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setData({ ...data, ssn: formatted });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setData({ ...data, phoneNumber: formatted });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!data.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!data.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (data.ssn.replace(/\D/g, '').length !== 9) newErrors.ssn = 'Valid SSN is required';
    if (data.phoneNumber.replace(/\D/g, '').length !== 10) newErrors.phoneNumber = 'Valid phone number is required';

    // Age validation (must be 18+)
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(data);
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
          <User className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Please enter your legal information as it appears on your ID
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={data.firstName}
            onChange={(e) => setData({ ...data, firstName: e.target.value })}
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={data.lastName}
            onChange={(e) => setData({ ...data, lastName: e.target.value })}
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-xs text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date of Birth
        </Label>
        <Input
          id="dob"
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
          className={errors.dateOfBirth ? 'border-destructive' : ''}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
        />
        {errors.dateOfBirth && (
          <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="ssn" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Social Security Number
        </Label>
        <div className="relative">
          <Input
            id="ssn"
            type={showSSN ? 'text' : 'password'}
            placeholder="XXX-XX-XXXX"
            value={data.ssn}
            onChange={handleSSNChange}
            className={`pr-10 ${errors.ssn ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowSSN(!showSSN)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSSN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.ssn && (
          <p className="text-xs text-destructive">{errors.ssn}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Your SSN is encrypted and securely stored
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Number
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={data.phoneNumber}
          onChange={handlePhoneChange}
          className={errors.phoneNumber ? 'border-destructive' : ''}
        />
        {errors.phoneNumber && (
          <p className="text-xs text-destructive">{errors.phoneNumber}</p>
        )}
      </div>

      <Button onClick={handleSubmit} className="w-full" size="lg">
        Continue
      </Button>
    </motion.div>
  );
}
