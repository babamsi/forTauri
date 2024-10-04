'use client';

import * as z from 'zod';
import { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '../ui/use-toast';
import {
  useUpdateProductMutation,
  useCreateProductMutation
} from '@/store/authApi';
import { getAuthCookie } from '@/actions/auth.actions';
import { BarcodeScanner } from '@thewirv/react-barcode-scanner';
import FileUpload from '../file-upload';

export const IMG_MAX_LIMIT = 3;

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Product Name must be at least 3 characters' }),
  description: z
    .string()
    .min(3, { message: 'Product description must be at least 3 characters' }),
  price: z.coerce.number(),
  sellPrice: z.coerce.number(),
  category: z.string().min(1, { message: 'Please select a category' }),
  units: z.string().min(1, { message: 'Please mention the units' }),
  quantity: z.coerce.number(),
  isQuantityBased: z.boolean(),
  vendor: z.string().min(4, { message: 'Please mention vendor' }),
  barcode: z.string().optional()
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
  categories: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [open, setOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [quantityOn, setQuantityOn] = useState(
    initialData?.isQuantityBased || false
  );
  const [cookies, setcookies] = useState(null);
  const title = initialData ? 'Edit product' : 'Create product';
  const description = initialData ? 'Edit a product.' : 'Add a new product';
  const toastMessage = initialData ? 'Product updated.' : 'Product created.';
  const action = initialData ? 'Save changes' : 'Create';

  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [create, { isLoading: isLoadingCreate, error }] =
    useCreateProductMutation();

  useEffect(() => {
    getAuthCookie().then((k: any) => {
      setcookies(k);
    });
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      sellPrice: initialData?.sellPrice || 0,
      category: initialData?.category || '',
      units: initialData?.units || '',
      quantity: initialData?.quantity || 0,
      isQuantityBased: initialData?.isQuantityBased || false,
      vendor: initialData?.vendor || '',
      barcode: initialData?.barcode || ''
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        const all = {
          id: initialData._id,
          data: data,
          cookies: cookies
        };
        const result = await updateProduct(all);
        if ('data' in result) {
          toast({
            variant: 'default',
            title: 'Success',
            description: 'Updated Successfully'
          });
        } else {
          throw new Error('Failed to update product');
        }
      } else {
        data.barcode = barcode;
        console.log(data);
        const result = await create({
          data: data,
          cookies
        });
        if ('data' in result) {
          toast({
            variant: 'default',
            title: 'Success',
            description: 'Created Successfully'
          });
        } else {
          throw new Error('Failed to create product');
        }
      }
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      // Implement delete functionality here
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the product.'
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <div className="gap-8 md:grid md:grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Units</FormLabel>
                  <FormControl>
                    <Input disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isQuantityBased"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setQuantityOn(!!checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Quantity Based</FormLabel>
                    <FormDescription>
                      This product is sold in discrete quantities
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {(initialData?.isQuantityBased || quantityOn) && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!initialData && (
              <>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price </FormLabel>
                      <FormControl>
                        <Input type="number" disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {quantityOn && (
                  <>
                    <div className="mb-4 flex space-x-2">
                      <Input
                        ref={barcodeInputRef}
                        type="text"
                        placeholder="Scan or enter barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="flex-grow"
                      />
                      <Button
                        onClick={() => setIsCameraActive(!isCameraActive)}
                      >
                        {isCameraActive ? 'Stop Camera' : 'Start Camera'}
                      </Button>
                    </div>
                    {isCameraActive && (
                      <div className="mb-4">
                        <BarcodeScanner
                          onSuccess={(result) => {
                            if (result) {
                              console.log(result);
                              setBarcode(result);
                            }
                          }}
                          onError={(error) => {
                            if (error) {
                              console.error(error.message);
                            }
                          }}
                          containerStyle={{ width: '100%', height: '300px' }}
                        />
                      </div>
                    )}
                  </>
                )}

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor </FormLabel>
                      <FormControl>
                        <Input disabled={loading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
