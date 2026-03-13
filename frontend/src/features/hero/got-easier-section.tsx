import Image from "next/image"
export default function GotEasier(){
    const cards = [
        {
          id: 1,
          image: '/2.png',
          title: 'Get CBSE-Level Question Papers in Seconds'
        },
        {
          id: 2,
          image: '/3.png',
          title: 'Finish lesson planning up to 10x faster'
        },
        {
          id: 3,
          image: '/1.png',
          title: 'Save up to 8+ hours weekly with smarter workflows'
        }
      ]
    return(
        <div className="flex flex-col p-4 md:p-6 lg:p-10 gap-2 justify-center items-center w-full">
            <div className="text-[32px] md:text-[40px] lg:text-[48px] font-semibold bg-gradient-to-b from-black to-[#001354] text-transparent bg-clip-text text-center">
                What Got Easier
            </div>
            <div className="text-[18px] md:text-[20px] lg:text-[24px] text-center">
                Used to take 40-60 mins? Now it takes seconds. 
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 lg:gap-14 mt-8 md:mt-12 lg:mt-14 w-full max-w-7xl px-4">
            {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col w-full md:w-84 pb-8 md:pb-12 items-center text-center bg-white rounded-lg border"
              style={{ borderColor: '#1B1B1B14' }}
            >
              {/* Card Image */}
              <div className="aspect-square relative flex items-center justify-center w-full">
                <Image
                  src={card.image || "/placeholder.svg"}
                  alt={card.title}
                  width={300}
                  height={300}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Card Title */}
              <h3 className="text-base md:text-lg lg:text-[19px] font-semibold text-balance bg-gradient-to-b from-black to-[#001354] text-transparent bg-clip-text px-4">
                {card.title}
              </h3>
            </div>
          ))}
            </div>
        </div>
    )
}