import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, RefreshCw, DollarSign, Calendar, Users, Percent } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { BookingDetails } from "@shared/schema";

interface PaymentSplitCalculatorProps {
  bookingDetails: BookingDetails;
  onClose?: () => void;
}

export const PaymentSplitCalculator: React.FC<PaymentSplitCalculatorProps> = ({
  bookingDetails,
  onClose
}) => {
  // Convert totalCost from cents to dollars for display
  const totalCostDollars = bookingDetails.totalCost / 100;
  
  // Calculate number of nights
  const checkInDate = new Date(bookingDetails.checkInDate);
  const checkOutDate = new Date(bookingDetails.checkOutDate);
  const numNights = differenceInDays(checkOutDate, checkInDate);
  
  // State for different splitting options
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom" | "nights">("equal");
  const numPeople = bookingDetails.participants.length;
  
  // Equal split just divides total by number of people
  const equalSplitAmount = totalCostDollars / numPeople;
  
  // Custom split percentages (starts with equal distribution)
  const [customSplits, setCustomSplits] = useState<number[]>(
    Array(numPeople).fill(100 / numPeople)
  );
  
  // Night-based split (for people staying different durations)
  const [nightsPerPerson, setNightsPerPerson] = useState<number[]>(
    Array(numPeople).fill(numNights)
  );
  
  // Toggle for premium room/better view
  const [hasPremiumOptions, setHasPremiumOptions] = useState(false);
  const [premiumUpcharge, setPremiumUpcharge] = useState(20); // $20 default upcharge
  const [personWithPremium, setPersonWithPremium] = useState(-1); // -1 means no one
  
  // Additional guest fees
  const [additionalGuestFees, setAdditionalGuestFees] = useState(0);
  
  // Calculate the final amounts for each person based on the selected method
  const calculateFinalAmounts = () => {
    let amounts: number[] = [];
    
    switch (splitMethod) {
      case "equal":
        amounts = Array(numPeople).fill(equalSplitAmount);
        break;
        
      case "custom":
        amounts = customSplits.map(percentage => (totalCostDollars * percentage) / 100);
        break;
        
      case "nights":
        const totalNights = nightsPerPerson.reduce((sum, nights) => sum + nights, 0);
        amounts = nightsPerPerson.map(nights => (totalCostDollars * nights) / totalNights);
        break;
    }
    
    // Apply premium room upcharge if applicable
    if (hasPremiumOptions && personWithPremium >= 0) {
      amounts = amounts.map((amount, idx) => {
        if (idx === personWithPremium) {
          return amount + premiumUpcharge;
        } else {
          // Distribute the discount equally among others
          return amount - (premiumUpcharge / (numPeople - 1));
        }
      });
    }
    
    // Add additional guest fees
    if (additionalGuestFees > 0) {
      // Only add to first person for simplicity, could be made configurable
      amounts[0] += additionalGuestFees;
    }
    
    return amounts;
  };
  
  const finalAmounts = calculateFinalAmounts();
  
  // Adjust custom percentages when a slider changes
  const handleCustomPercentageChange = (index: number, newValue: number) => {
    const newSplits = [...customSplits];
    const oldValue = newSplits[index];
    const delta = newValue - oldValue;
    
    // Update the selected person's percentage
    newSplits[index] = newValue;
    
    // Distribute the change proportionally among others
    const remainingPercent = 100 - newValue;
    const otherIndices = Array.from({length: numPeople}, (_, i) => i).filter(i => i !== index);
    const sumOthers = otherIndices.reduce((sum, i) => sum + newSplits[i], 0);
    
    otherIndices.forEach(i => {
      if (sumOthers === 0) {
        // If all others were 0, distribute equally
        newSplits[i] = remainingPercent / otherIndices.length;
      } else {
        // Otherwise adjust proportionally
        newSplits[i] = Math.max(0, newSplits[i] - (delta * newSplits[i] / sumOthers));
      }
    });
    
    // Ensure they sum exactly to 100%
    const sum = newSplits.reduce((acc, val) => acc + val, 0);
    if (sum !== 100 && otherIndices.length > 0) {
      const adjust = (100 - sum) / otherIndices.length;
      otherIndices.forEach(i => {
        newSplits[i] += adjust;
      });
    }
    
    setCustomSplits(newSplits.map(val => Math.round(val * 10) / 10)); // Round to 1 decimal place
  };
  
  const handleNightsChange = (index: number, change: number) => {
    const newNights = [...nightsPerPerson];
    newNights[index] = Math.max(1, newNights[index] + change); // Minimum 1 night
    setNightsPerPerson(newNights);
  };
  
  const resetToEqual = () => {
    setSplitMethod("equal");
    setCustomSplits(Array(numPeople).fill(100 / numPeople));
    setNightsPerPerson(Array(numPeople).fill(numNights));
    setHasPremiumOptions(false);
    setPersonWithPremium(-1);
    setAdditionalGuestFees(0);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="bg-primary/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-primary text-xl">Payment Split Calculator</CardTitle>
            <CardDescription>
              Customize how to split the total cost of ${totalCostDollars.toFixed(2)} 
              for {numNights} {numNights === 1 ? 'night' : 'nights'}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500">
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="equal" value={splitMethod} onValueChange={(v) => setSplitMethod(v as any)}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="equal">
              <Users className="h-4 w-4 mr-2" /> Equal Split
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Percent className="h-4 w-4 mr-2" /> Custom (%)
            </TabsTrigger>
            <TabsTrigger value="nights">
              <Calendar className="h-4 w-4 mr-2" /> By Nights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="equal" className="space-y-4">
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Everyone pays equally</p>
              <p className="text-2xl font-bold text-primary">
                ${equalSplitAmount.toFixed(2)} <span className="text-sm text-gray-500">per person</span>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Adjust the percentage each person contributes
            </p>
            
            {bookingDetails.participants.map((participant, index) => (
              <div key={participant.id} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <Label>{participant.user.fullName}</Label>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-1 text-sm">{customSplits[index].toFixed(1)}%</span>
                    <span className="text-primary font-medium">
                      ${((totalCostDollars * customSplits[index]) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[customSplits[index]]}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={(value) => handleCustomPercentageChange(index, value[0])}
                />
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="nights" className="space-y-4">
            <p className="text-sm text-gray-500 mb-4">
              Adjust how many nights each person stays
            </p>
            
            {bookingDetails.participants.map((participant, index) => (
              <div key={participant.id} className="flex items-center justify-between mb-4 border-b pb-4">
                <span>{participant.user.fullName}</span>
                
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleNightsChange(index, -1)}
                    disabled={nightsPerPerson[index] <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="mx-3 min-w-[40px] text-center">
                    {nightsPerPerson[index]} {nightsPerPerson[index] === 1 ? 'night' : 'nights'}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleNightsChange(index, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  <span className="ml-4 text-primary font-medium">
                    ${finalAmounts[index].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        {/* Additional Options */}
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="premium-room"
                checked={hasPremiumOptions}
                onCheckedChange={setHasPremiumOptions}
              />
              <Label htmlFor="premium-room">Premium Room/Better View</Label>
            </div>
            
            {hasPremiumOptions && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="premium-upcharge" className="text-sm">Upcharge: $</Label>
                <input
                  id="premium-upcharge"
                  type="number"
                  className="w-16 p-2 border rounded-md"
                  value={premiumUpcharge}
                  onChange={(e) => setPremiumUpcharge(Number(e.target.value))}
                  min={0}
                />
              </div>
            )}
          </div>
          
          {hasPremiumOptions && (
            <div className="pl-10 space-y-2">
              <p className="text-sm text-gray-500">Who gets the premium option?</p>
              {bookingDetails.participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`premium-${index}`}
                    name="premium-person"
                    checked={personWithPremium === index}
                    onChange={() => setPersonWithPremium(index)}
                  />
                  <Label htmlFor={`premium-${index}`}>{participant.user.fullName}</Label>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label htmlFor="additional-fees">Additional Guest Fees</Label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <input
                id="additional-fees"
                type="number"
                className="w-20 p-2 border rounded-md"
                value={additionalGuestFees}
                onChange={(e) => setAdditionalGuestFees(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Final Breakdown */}
        <div>
          <h3 className="font-medium text-lg mb-3">Final Split</h3>
          
          {bookingDetails.participants.map((participant, index) => (
            <div key={participant.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{participant.user.fullName}</p>
                {splitMethod === "custom" && (
                  <p className="text-sm text-gray-500">{customSplits[index].toFixed(1)}%</p>
                )}
                {splitMethod === "nights" && (
                  <p className="text-sm text-gray-500">{nightsPerPerson[index]} nights</p>
                )}
                {hasPremiumOptions && personWithPremium === index && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Premium</span>
                )}
              </div>
              <p className="text-xl font-bold text-primary">${finalAmounts[index].toFixed(2)}</p>
            </div>
          ))}
          
          <div className="flex justify-between items-center py-3 mt-2">
            <p className="font-medium">Total</p>
            <p className="text-xl font-bold">
              ${finalAmounts.reduce((sum, amount) => sum + amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={resetToEqual}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
          
          <Button className="bg-primary text-white">
            <DollarSign className="h-4 w-4 mr-2" /> 
            Save Split
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSplitCalculator;