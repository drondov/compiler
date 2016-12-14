program sum100 begin
	i := 0;
	sum := 0;
	while i < 100.999 do {
		sum := sum + i;
		i := i + 1;
	};
	write(sum);
end